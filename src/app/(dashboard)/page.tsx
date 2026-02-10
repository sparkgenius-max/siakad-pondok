import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
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

export default async function DashboardPage() {
    const supabase = await createClient()
    const today = new Date().toISOString().split('T')[0]
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    // Parallel fetch untuk performa lebih baik
    const [
        santriResult,
        activeSantriResult,
        pendingPermissionsResult,
        activePermissionsResult,
        paymentsThisMonthResult,
        unpaidThisMonthResult,
        totalGradesResult,
        recentPaymentsResult,
        pendingPermissionsListResult,
        presentTodayResult
    ] = await Promise.all([
        // Total santri
        supabase.from('santri').select('*', { count: 'exact', head: true }),
        // Santri aktif
        supabase.from('santri').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        // Perizinan pending
        supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        // Santri sedang izin hari ini
        supabase.from('permissions')
            .select('*, santri(name, class)')
            .eq('status', 'approved')
            .lte('start_date', today)
            .gte('end_date', today),
        // Pembayaran bulan ini
        supabase.from('payments')
            .select('amount')
            .eq('month', currentMonth)
            .eq('year', currentYear)
            .eq('status', 'paid'),
        // Yang belum bayar bulan ini (santri aktif - yang sudah bayar)
        supabase.from('payments')
            .select('santri_id', { count: 'exact', head: true })
            .eq('month', currentMonth)
            .eq('year', currentYear),
        // Total nilai
        supabase.from('grades').select('*', { count: 'exact', head: true }),
        // 5 pembayaran terakhir
        supabase.from('payments')
            .select('id, amount, month, year, status, payment_date, santri(name, nis)')
            .order('created_at', { ascending: false })
            .limit(5),
        // 5 perizinan pending
        supabase.from('permissions')
            .select('id, type, start_date, end_date, reason, santri(name, class)')
            .eq('status', 'pending')
            .order('created_at', { ascending: false })
            .limit(5),
        // Absensi hari ini (Hadir)
        supabase.from('attendance')
            .select('*', { count: 'exact', head: true })
            .eq('date', today)
            .eq('status', 'present')
    ])

    const totalSantri = santriResult.count || 0
    const activeSantri = activeSantriResult.count || 0
    const pendingPermissions = pendingPermissionsResult.count || 0
    const activePermissions = activePermissionsResult.data || []
    const paymentsThisMonth = paymentsThisMonthResult.data || []
    const paidCount = unpaidThisMonthResult.count || 0
    const unpaidCount = activeSantri - paidCount
    const totalGrades = totalGradesResult.count || 0
    const recentPayments = recentPaymentsResult.data || []
    const pendingPermissionsList = pendingPermissionsListResult.data || []
    const presentToday = presentTodayResult.count || 0

    // Hitung total pemasukan bulan ini
    const totalIncomeThisMonth = paymentsThisMonth.reduce((sum, p) => sum + (p.amount || 0), 0)

    // Format tanggal Indonesia
    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    // Get month name
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    // Permission type labels
    const typeLabels: Record<string, string> = {
        sick: 'Sakit',
        permit: 'Izin',
        late: 'Telat',
        other: 'Lainnya'
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

            {/* Stats Cards Row 1 */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-blue-500">
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
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">Rp {totalIncomeThisMonth.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">
                            {paymentsThisMonth.length} pembayaran
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-yellow-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menunggu Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{pendingPermissions}</div>
                        <p className="text-xs text-muted-foreground">
                            Perizinan pending
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hadir Hari Ini</CardTitle>
                        <ListChecks className="h-4 w-4 text-purple-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{presentToday}</div>
                        <p className="text-xs text-muted-foreground">
                            Santri hadir
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Alert Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Belum Bayar */}
                {unpaidCount > 0 && (
                    <Card className="bg-red-50 border-red-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                                <CardTitle className="text-base text-red-700">Belum Bayar Bulan Ini</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-2xl font-bold text-red-600">{unpaidCount} santri</p>
                            <p className="text-sm text-red-600/70">Belum bayar syahriah {monthNames[currentMonth]} {currentYear}</p>
                            <Button variant="outline" size="sm" className="mt-3 border-red-300 text-red-600 hover:bg-red-100" asChild>
                                <Link href={`/payments?tab=recap&month=${currentMonth}&year=${currentYear}`}>
                                    Lihat Detail <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* Santri Sedang Izin */}
                {activePermissions.length > 0 && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-blue-500" />
                                <CardTitle className="text-base text-blue-700">Santri Sedang Izin Hari Ini</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                {activePermissions.slice(0, 3).map((p: any) => (
                                    <div key={p.id} className="flex items-center justify-between text-sm">
                                        <span className="font-medium text-blue-800">{p.santri?.name}</span>
                                        <Badge variant="outline" className="text-blue-600 border-blue-300">
                                            {typeLabels[p.type] || p.type}
                                        </Badge>
                                    </div>
                                ))}
                                {activePermissions.length > 3 && (
                                    <p className="text-xs text-blue-600">+{activePermissions.length - 3} lainnya</p>
                                )}
                            </div>
                            <Button variant="outline" size="sm" className="mt-3 border-blue-300 text-blue-600 hover:bg-blue-100" asChild>
                                <Link href="/permissions?tab=approved">
                                    Lihat Semua <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Main Content */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Pembayaran Terbaru */}
                <Card className="lg:col-span-4">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Pembayaran Terbaru</CardTitle>
                            <CardDescription>5 pembayaran terakhir</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/payments">Lihat Semua</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentPayments.map((payment: any) => (
                                <div className="flex items-center" key={payment.id}>
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                                        <CheckCircle className="h-4 w-4 text-green-600" />
                                    </div>
                                    <div className="ml-4 space-y-1 flex-1">
                                        <p className="text-sm font-medium leading-none">
                                            {payment.santri?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {monthNames[payment.month]} {payment.year} • {formatDate(payment.payment_date)}
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={payment.status === 'paid' ? 'default' : 'secondary'} className={payment.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                                            {payment.status === 'paid' ? 'Lunas' : 'Sebagian'}
                                        </Badge>
                                        <span className="font-medium text-green-600">
                                            +Rp {payment.amount?.toLocaleString('id-ID')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {!recentPayments.length && (
                                <p className="text-sm text-muted-foreground text-center py-8">Belum ada pembayaran</p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Perizinan Pending */}
                <Card className="lg:col-span-3">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>Perizinan Menunggu</CardTitle>
                            <CardDescription>Perlu approval</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/permissions?tab=pending">Lihat Semua</Link>
                        </Button>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {pendingPermissionsList.map((perm: any) => (
                                <div className="flex items-start gap-3" key={perm.id}>
                                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-yellow-100 shrink-0">
                                        <Clock className="h-4 w-4 text-yellow-600" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate">
                                            {perm.santri?.name}
                                        </p>
                                        <p className="text-xs text-muted-foreground">
                                            {typeLabels[perm.type] || perm.type} • {formatDate(perm.start_date)} - {formatDate(perm.end_date)}
                                        </p>
                                        <p className="text-xs text-muted-foreground truncate mt-1">
                                            {perm.reason}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {!pendingPermissionsList.length && (
                                <div className="text-center py-8">
                                    <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-muted-foreground">Tidak ada perizinan pending</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Aksi Cepat</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-3">
                        <Button variant="outline" asChild>
                            <Link href="/santri">
                                <Users className="mr-2 h-4 w-4" />
                                Kelola Santri
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/payments">
                                <Wallet className="mr-2 h-4 w-4" />
                                Input Pembayaran
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/payments/bulk">
                                <ListChecks className="mr-2 h-4 w-4" />
                                Generate Tagihan
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/permissions?tab=pending">
                                <Clock className="mr-2 h-4 w-4" />
                                Approve Perizinan
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/grades/batch">
                                <GraduationCap className="mr-2 h-4 w-4" />
                                Input Nilai Batch
                            </Link>
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/attendance">
                                <ListChecks className="mr-2 h-4 w-4" />
                                Absensi Harian
                            </Link>
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
