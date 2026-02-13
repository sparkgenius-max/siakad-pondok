import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import Link from 'next/link'
import { ExportButton } from '@/components/export-button'
import {
    Users,
    Wallet,
    Clock,
    GraduationCap,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Calendar,
    ArrowRight,
    DollarSign,
    FileSpreadsheet,
    ListChecks
} from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
    const supabaseClient = await createClient()
    const { data: { user } } = await supabaseClient.auth.getUser()
    const supabase = createAdminClient()

    let role = 'guru'
    if (user) {
        const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (data?.role) {
            role = data.role.toLowerCase()
        }
    }

    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Normalize: treat 'ustadz' the same as 'guru' for feature restrictions
    const isGuru = role === 'guru' || role === 'ustadz'

    // Parallel fetch untuk performa lebih baik
    const [
        santriResult,
        activeSantriResult,
        activePermissionsResult,
        paymentsThisMonthResult,
        totalGradesResult,
        recentPaymentsResult,
        presentTodayResult
    ] = await Promise.all([
        // Total santri
        supabase.from('santri').select('*', { count: 'exact', head: true }),
        // Santri aktif
        supabase.from('santri').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        // Santri sedang izin hari ini (Only if not guru)
        !isGuru ? supabase.from('permissions')
            .select('*, santri(name, class)')
            .in('status', ['approved', 'berlangsung'])
            .lte('start_date', today)
            .gte('end_date', today) : Promise.resolve({ data: [] }),
        // Pembayaran bulan ini (Only if not guru)
        !isGuru ? supabase.from('payments')
            .select('amount, santri_id')
            .eq('month', currentMonth)
            .eq('year', currentYear) : Promise.resolve({ data: [] }),
        // Total nilai
        supabase.from('grades').select('*', { count: 'exact', head: true }),
        // 5 pembayaran terakhir (Only if not guru)
        !isGuru ? supabase.from('payments')
            .select('id, amount, month, year, status, payment_date, santri(id, name, nis)')
            .order('created_at', { ascending: false })
            .limit(5) : Promise.resolve({ data: [] }),
        // Absensi hari ini (Hadir)
        supabase.from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('date', today)
            .eq('status', 'present')
    ])

    const totalSantri = santriResult.count || 0
    const activeSantri = activeSantriResult.count || 0
    const activePermissions = activePermissionsResult.data || []
    const paymentsThisMonth = paymentsThisMonthResult.data || []
    const totalGrades = totalGradesResult.count || 0
    const recentPayments = recentPaymentsResult.data || []
    const presentToday = presentTodayResult.count || 0

    // Hitung total pemasukan bulan ini (Semua status: paid & partial)
    const totalIncomeThisMonth = paymentsThisMonth.reduce((sum, p: any) => sum + (p.amount || 0), 0)

    // Hitung yang sudah bayar (Unique Santri IDs)
    const paidSantriIds = new Set(paymentsThisMonth.map((p: any) => p.santri_id))
    const paidCount = paidSantriIds.size
    const unpaidCount = activeSantri - paidCount

    // Format tanggal Indonesia
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    // Get month name
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    // Permission type labels
    const typeLabels: Record<string, string> = {
        pulang: 'Pulang',
        kegiatan_luar: 'Keluar',
        organisasi: 'Orgn',
        sick: 'Sakit',
        permit: 'Izin'
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Dashboard</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Ringkasan data pondok pesantren</p>
                </div>
                <div className="flex items-center gap-3">
                    <ExportButton />
                    <p className="text-xs md:text-sm text-muted-foreground bg-muted px-2 py-1 rounded-md">
                        {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>
            </div>

            {/* Stats Cards Row 1 - Now with Contextual Actions */}
            <div className={`grid gap-4 md:grid-cols-2 ${isGuru ? 'lg:grid-cols-3' : 'lg:grid-cols-5'}`}>
                <Card className="border-l-4 border-l-blue-500 relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{activeSantri}</div>
                        <p className="text-xs text-muted-foreground">
                            {totalSantri - activeSantri > 0 && `+${totalSantri - activeSantri} tidak aktif`}
                            {totalSantri - activeSantri === 0 && 'Semua santri aktif'}
                        </p>
                        <Button variant="ghost" size="sm" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs" asChild>
                            <Link href="/santri">Kelola <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                    </CardContent>
                </Card>

                {!isGuru && (
                    <>
                        <Card className="border-l-4 border-l-green-500 relative overflow-hidden group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
                                <DollarSign className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {totalIncomeThisMonth.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground">
                                    {paymentsThisMonth.length} pembayaran
                                </p>
                                <Button variant="ghost" size="sm" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs" asChild>
                                    <Link href="/payments">Input Bayar <ArrowRight className="ml-1 h-3 w-3" /></Link>
                                </Button>
                            </CardContent>
                        </Card>

                        <Card className="border-l-4 border-l-red-500 relative overflow-hidden group">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
                                <p className="text-xs text-muted-foreground">
                                    Bulan {monthNames[currentMonth]} {currentYear}
                                </p>
                            </CardContent>
                        </Card>
                    </>
                )}

                <Card className="border-l-4 border-l-orange-500 relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nilai Input</CardTitle>
                        <GraduationCap className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalGrades}</div>
                        <p className="text-xs text-muted-foreground">
                            Total rekaman nilai
                        </p>
                        <Button variant="ghost" size="sm" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs" asChild>
                            <Link href="/grades/batch">Input Nilai <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500 relative overflow-hidden group">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
                        <ListChecks className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentToday}</div>
                        <p className="text-xs text-muted-foreground">
                            Santri hadir
                        </p>
                        <Button variant="ghost" size="sm" className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-6 text-xs" asChild>
                            <Link href="/attendance">Absensi <ArrowRight className="ml-1 h-3 w-3" /></Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            {!isGuru && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    {/* Pembayaran Terbaru */}
                    <Card className="lg:col-span-4 rounded-xl border-none shadow-sm md:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Pembayaran Terbaru</CardTitle>
                                <CardDescription>5 pembayaran terakhir</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/payments">Lihat Semua</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentPayments.length > 0 ? (
                                    recentPayments.map((payment: any) => (
                                        <Link href={`/santri/${payment.santri?.id}`} className="flex items-center group hover:bg-slate-50 p-2 rounded-lg transition-colors" key={payment.id}>
                                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100 group-hover:bg-green-200 transition-colors">
                                                <CheckCircle className="h-4 w-4 text-green-600" />
                                            </div>
                                            <div className="ml-4 space-y-1 flex-1">
                                                <p className="text-sm font-medium leading-none group-hover:text-primary transition-colors">
                                                    {payment.santri?.name}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {monthNames[payment.month]} {payment.year} • {formatDate(payment.payment_date)}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className={payment.status === 'paid' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-yellow-100 text-yellow-700'}>
                                                    {payment.status === 'paid' ? 'Lunas' : 'Sebagian'}
                                                </Badge>
                                                <span className="font-medium text-green-600 text-sm">
                                                    +Rp {payment.amount?.toLocaleString('id-ID')}
                                                </span>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-sm text-muted-foreground text-center py-12 bg-slate-50 rounded-lg border border-dashed">Belum ada pembayaran</p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Perizinan Pending / Santri Sedang Izin */}
                    <Card className="lg:col-span-3 rounded-xl border-none shadow-sm md:shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Santri Sedang Izin</CardTitle>
                                <CardDescription>Berlangsung hari ini</CardDescription>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/permissions?tab=approved">Lihat Semua</Link>
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {activePermissions.length > 0 ? (
                                    activePermissions.map((perm: any) => (
                                        <div className="flex items-start gap-4 p-2 rounded-lg hover:bg-slate-50 transition-colors" key={perm.id}>
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 shrink-0">
                                                <Clock className="h-5 w-5 text-blue-600" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <Link href={`/santri/${perm.santri?.id}`} className="block">
                                                    <p className="text-sm font-medium truncate hover:text-primary hover:underline decoration-blue-500 underline-offset-4 cursor-pointer">
                                                        {perm.santri?.name}
                                                    </p>
                                                </Link>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
                                                        {typeLabels[perm.type] || perm.type}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground">
                                                        Sampai: {formatDate(perm.end_date)}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-slate-50 rounded-lg border border-dashed">
                                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2 opacity-50" />
                                        <p className="text-sm text-muted-foreground">Semua santri ada di pondok</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
