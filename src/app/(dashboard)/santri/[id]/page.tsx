import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    ArrowLeft, User, Phone, Home, GraduationCap, BookOpen, Repeat,
    CreditCard, Clock, FileText, TrendingUp, CalendarCheck
} from 'lucide-react'

export const dynamic = 'force-dynamic'

// Mapel subjects per program
const TAHFIDZ_SUBJECTS = [
    'KELANCARAN',
    'FASHOHAH',
    'TAJWID',
    'SAMBUNGAYAT',
    'TAKLIM KITAB SUBUH',
    "TAKLIM KITAB ISYA'",
]

const DINIYAH_SUBJECTS = [
    'AL-MIFTAH JILID 1',
    'AL-MIFTAH JILID 2',
    'AL-MIFTAH JILID 3',
    'AL-MIFTAH JILID 4',
    'SORROF',
    'BACA KITAB',
    'TAKLIM KITAB SUBUH',
    "TAKLIM KITAB ISYA'",
]

export default async function SantriDetailPage({
    params,
    searchParams,
}: {
    params: Promise<{ id: string }>
    searchParams: Promise<{ tab?: string }>
}) {
    const { id } = await params
    const { tab } = await searchParams
    const activeTab = tab || 'grades'
    const supabase = createAdminClient()

    // Fetch santri data (V2: program is a text column directly on santri)
    const { data: santri, error } = await supabase
        .from('santri')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !santri) {
        notFound()
    }

    // Determine program type
    const programType = (santri.program || '').toLowerCase()
    const isTahfidz = programType === 'tahfidz'
    const isDiniyah = programType === 'diniyah'

    // Fetch all related data in parallel
    const [
        { data: payments },
        { data: permissions },
        { data: grades },
        tahfidzResult,
        { data: attendance },
    ] = await Promise.all([
        supabase
            .from('payments')
            .select('*')
            .eq('santri_id', id)
            .order('year', { ascending: false })
            .order('month', { ascending: false })
            .limit(20),
        supabase
            .from('permissions')
            .select('*')
            .eq('santri_id', id)
            .order('created_at', { ascending: false })
            .limit(20),
        supabase
            .from('grades')
            .select('*')
            .eq('santri_id', id)
            .order('academic_year', { ascending: false })
            .limit(30),
        isTahfidz
            ? supabase
                .from('monitoring_tahfidz')
                .select('*')
                .eq('santri_id', id)
                .order('date', { ascending: false })
                .limit(30)
            : Promise.resolve({ data: [] as any[] }),
        supabase
            .from('attendance')
            .select('*')
            .eq('santri_id', id)
            .order('date', { ascending: false })
            .limit(30),
    ])

    const tahfidzLogs = tahfidzResult?.data || []

    // Filter grades by program type
    const filteredGrades = grades?.filter(g => {
        if (isTahfidz) return (g.program_type || '').toLowerCase() === 'tahfidz'
        if (isDiniyah) return (g.program_type || '').toLowerCase() === 'diniyah'
        return true
    }) || []

    // Calculate stats
    const totalPaid = payments?.filter(p => p.status === 'paid').length || 0
    const totalPending = payments?.filter(p => p.status === 'pending').length || 0
    const totalPermissions = permissions?.length || 0
    const avgGrade = filteredGrades.length
        ? (filteredGrades.reduce((acc, g) => acc + parseFloat(g.score_total || g.grade || '0'), 0) / filteredGrades.length).toFixed(1)
        : '-'
    const totalZiyadah = tahfidzLogs?.reduce((acc: number, l: any) => acc + (l.ziyadah_pages || 0), 0) || 0
    const totalMurojaah = tahfidzLogs?.reduce((acc: number, l: any) => acc + (l.murojaah_juz || 0), 0) || 0

    const statusColors: Record<string, string> = {
        active: 'bg-green-100 text-green-800',
        inactive: 'bg-gray-100 text-gray-800',
        graduated: 'bg-blue-100 text-blue-800',
    }

    const statusLabels: Record<string, string> = {
        active: 'Aktif',
        inactive: 'Tidak Aktif',
        graduated: 'Alumni',
    }

    const typeLabels: Record<string, string> = {
        sick: 'Sakit', permit: 'Izin', late: 'Terlambat', other: 'Lainnya',
        pulang: 'Pulang', kegiatan_luar: 'Kegiatan Luar', organisasi: 'Organisasi'
    }

    const permissionStatusLabels: Record<string, string> = {
        pending: 'Pending', approved: 'Disetujui', rejected: 'Ditolak',
        berlangsung: 'Berlangsung', selesai: 'Selesai', terlambat: 'Terlambat'
    }

    const permissionStatusColors: Record<string, string> = {
        pending: 'bg-yellow-100 text-yellow-800',
        approved: 'bg-green-100 text-green-800',
        rejected: 'bg-red-100 text-red-800',
        berlangsung: 'bg-blue-100 text-blue-800',
        selesai: 'bg-green-100 text-green-800',
        terlambat: 'bg-red-100 text-red-800'
    }

    const attendanceStatusLabels: Record<string, string> = {
        present: 'Hadir', sick: 'Sakit', permission: 'Izin', alpha: 'Alpha'
    }

    const attendanceStatusColors: Record<string, string> = {
        present: 'bg-green-100 text-green-800',
        sick: 'bg-yellow-100 text-yellow-800',
        permission: 'bg-blue-100 text-blue-800',
        alpha: 'bg-red-100 text-red-800'
    }

    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

    // Expected subjects for this santri's program
    const expectedSubjects = isTahfidz ? TAHFIDZ_SUBJECTS : isDiniyah ? DINIYAH_SUBJECTS : []

    // Count attendance stats
    const attendancePresent = attendance?.filter(a => a.status === 'present').length || 0
    const attendanceSick = attendance?.filter(a => a.status === 'sick').length || 0
    const attendancePermission = attendance?.filter(a => a.status === 'permission').length || 0
    const attendanceAlpha = attendance?.filter(a => a.status === 'alpha').length || 0

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            {/* Header */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
                <Button variant="ghost" size="icon" asChild title="Kembali" className="self-start">
                    <Link href="/santri">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{santri.name}</h2>
                        <Badge className={statusColors[santri.status as string] || 'bg-gray-100'}>
                            {statusLabels[santri.status as string] || santri.status}
                        </Badge>
                    </div>
                    <p className="text-muted-foreground mt-1">NIS: {santri.nis}</p>
                    {/* Program badge */}
                    {santri.program && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            <Badge variant="outline" className="text-xs">
                                {isTahfidz ? '📖' : isDiniyah ? '📚' : '💼'} {santri.program}
                            </Badge>
                        </div>
                    )}
                </div>
            </div>

            {/* Profile Cards */}
            <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kelas</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{santri.class}</div>
                        {santri.dorm && <p className="text-xs text-muted-foreground">Asrama: {santri.dorm}</p>}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pembayaran</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-700">{totalPaid}</div>
                        <p className="text-xs text-muted-foreground">Lunas • {totalPending} pending</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Perizinan</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalPermissions}</div>
                        <p className="text-xs text-muted-foreground">Total riwayat</p>
                    </CardContent>
                </Card>
                {isTahfidz ? (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hafalan</CardTitle>
                            <BookOpen className="h-4 w-4 text-emerald-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-emerald-700">{totalZiyadah} <span className="text-sm font-normal">hal</span></div>
                            <p className="text-xs text-muted-foreground">Murojaah: {totalMurojaah} juz</p>
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Rata-rata Nilai</CardTitle>
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-700">{avgGrade}</div>
                            <p className="text-xs text-muted-foreground">{filteredGrades.length} mata pelajaran</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Dynamic Tabs */}
            <Tabs defaultValue={activeTab} className="space-y-4">
                <TabsList className="flex-wrap h-auto gap-1">
                    <TabsTrigger value="grades" className="gap-1">
                        <GraduationCap className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">{isTahfidz ? 'Nilai Tahfidz' : isDiniyah ? 'Nilai Diniyah' : 'Nilai'}</span>
                        <span className="sm:hidden">Nilai</span>
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{filteredGrades.length}</Badge>
                    </TabsTrigger>
                    {isTahfidz && (
                        <TabsTrigger value="tahfidz" className="gap-1">
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="hidden sm:inline">Monitoring Hafalan</span>
                            <span className="sm:hidden">Hafalan</span>
                            <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{tahfidzLogs?.length || 0}</Badge>
                        </TabsTrigger>
                    )}
                    <TabsTrigger value="payments" className="gap-1">
                        <CreditCard className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Syahriah</span>
                        <span className="sm:hidden">Bayar</span>
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{payments?.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="permissions" className="gap-1">
                        <FileText className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Perizinan</span>
                        <span className="sm:hidden">Izin</span>
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{permissions?.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="attendance" className="gap-1">
                        <CalendarCheck className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Absensi</span>
                        <span className="sm:hidden">Absen</span>
                        <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">{attendance?.length || 0}</Badge>
                    </TabsTrigger>
                    <TabsTrigger value="profile" className="gap-1">
                        <User className="h-3.5 w-3.5" />
                        Profil
                    </TabsTrigger>
                </TabsList>

                {/* NILAI TAB */}
                <TabsContent value="grades" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <CardTitle>
                                        {isTahfidz ? 'Nilai Mata Pelajaran Tahfidz' : isDiniyah ? 'Nilai Mata Pelajaran Diniyah' : 'Nilai Akademik'}
                                    </CardTitle>
                                    <CardDescription>
                                        {isTahfidz
                                            ? 'Kelancaran, Fashohah, Tajwid, Sambung Ayat, Taklim Kitab Subuh & Isya'
                                            : isDiniyah
                                                ? 'Al-Miftah Jilid 1-4, Sorrof, Baca Kitab, Taklim Kitab Subuh & Isya'
                                                : 'Semua nilai mapel'}
                                    </CardDescription>
                                </div>
                                {avgGrade !== '-' && (
                                    <div className="flex items-center gap-2 bg-blue-50 px-3 py-1.5 rounded-lg">
                                        <TrendingUp className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-800">Rata-rata: {avgGrade}</span>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="space-y-3 md:hidden">
                                {filteredGrades.length ? filteredGrades.map((g: any) => (
                                    <div key={g.id} className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium text-sm">{g.subject}</span>
                                            <span className="text-lg font-bold text-primary">{g.score_total ?? g.grade ?? '-'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{g.semester}</span>
                                            <span>•</span>
                                            <span>{g.academic_year}</span>
                                        </div>
                                        {(g.score_theory != null || g.score_practice != null) && (
                                            <div className="flex items-center gap-3 mt-1.5">
                                                {g.score_theory != null && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        Teori: {g.score_theory}
                                                    </Badge>
                                                )}
                                                {g.score_practice != null && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        Praktik: {g.score_practice}
                                                    </Badge>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">Belum ada catatan nilai.</p>
                                )}
                            </div>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            {isDiniyah && <TableHead>Nilai Teori</TableHead>}
                                            {isDiniyah && <TableHead>Nilai Praktik</TableHead>}
                                            <TableHead>Nilai Total</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Tahun Ajaran</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredGrades.length ? filteredGrades.map((g: any) => (
                                            <TableRow key={g.id}>
                                                <TableCell className="font-medium">{g.subject}</TableCell>
                                                {isDiniyah && <TableCell>{g.score_theory ?? '-'}</TableCell>}
                                                {isDiniyah && <TableCell>{g.score_practice ?? '-'}</TableCell>}
                                                <TableCell className="font-bold text-primary">{g.score_total ?? g.grade ?? '-'}</TableCell>
                                                <TableCell>{g.semester}</TableCell>
                                                <TableCell>{g.academic_year}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={isDiniyah ? 6 : 4} className="text-center text-muted-foreground h-24">
                                                    Belum ada catatan nilai.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Expected Subjects Reference */}
                            {expectedSubjects.length > 0 && (
                                <div className="mt-6 pt-4 border-t">
                                    <p className="text-xs font-medium text-muted-foreground mb-2">Daftar Mata Pelajaran {santri.program}:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {expectedSubjects.map((subject, idx) => {
                                            const hasGrade = filteredGrades.some(g => g.subject?.toUpperCase() === subject.toUpperCase())
                                            return (
                                                <Badge key={idx} variant="outline" className={`text-[10px] ${hasGrade ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-50 text-slate-500'}`}>
                                                    {idx + 1}. {subject} {hasGrade ? '✓' : ''}
                                                </Badge>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* MONITORING TAHFIDZ TAB (Only for Tahfidz students) */}
                {isTahfidz && (
                    <TabsContent value="tahfidz" className="space-y-4">
                        {/* Summary cards */}
                        <div className="grid gap-3 grid-cols-2">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Ziyadah</CardTitle>
                                    <BookOpen className="h-4 w-4 text-emerald-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-emerald-700">{totalZiyadah} <span className="text-sm font-normal text-slate-500">halaman</span></div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total Murojaah</CardTitle>
                                    <Repeat className="h-4 w-4 text-blue-600" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold text-blue-700">{totalMurojaah} <span className="text-sm font-normal text-slate-500">juz</span></div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Log Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Log Hafalan</CardTitle>
                                <CardDescription>Riwayat setoran hafalan santri</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* Mobile Cards */}
                                <div className="space-y-3 md:hidden">
                                    {tahfidzLogs?.length ? tahfidzLogs.map((log: any) => (
                                        <div key={log.id} className="bg-slate-50 rounded-lg p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium">
                                                    {new Date(log.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1">
                                                {log.ziyadah_pages > 0 && (
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                        Ziyadah: {log.ziyadah_pages} hal
                                                    </Badge>
                                                )}
                                                {log.murojaah_juz > 0 && (
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        Murojaah: {log.murojaah_juz} juz
                                                    </Badge>
                                                )}
                                            </div>
                                            {log.notes && <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>}
                                        </div>
                                    )) : (
                                        <p className="text-center text-muted-foreground py-8">Belum ada data hafalan.</p>
                                    )}
                                </div>
                                {/* Desktop Table */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Tanggal</TableHead>
                                                <TableHead>Ziyadah (Hal)</TableHead>
                                                <TableHead>Murojaah (Juz)</TableHead>
                                                <TableHead>Catatan</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {tahfidzLogs?.length ? tahfidzLogs.map((log: any) => (
                                                <TableRow key={log.id}>
                                                    <TableCell>{new Date(log.date).toLocaleDateString('id-ID')}</TableCell>
                                                    <TableCell>
                                                        {log.ziyadah_pages > 0 ? (
                                                            <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                                {log.ziyadah_pages}
                                                            </Badge>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell>
                                                        {log.murojaah_juz > 0 ? (
                                                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                                {log.murojaah_juz}
                                                            </Badge>
                                                        ) : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{log.notes || '-'}</TableCell>
                                                </TableRow>
                                            )) : (
                                                <TableRow>
                                                    <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                        Belum ada data hafalan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}

                {/* PEMBAYARAN/SYAHRIAH TAB */}
                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Pembayaran Syahriah</CardTitle>
                            <CardDescription>Pembayaran syahriah santri ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="space-y-3 md:hidden">
                                {payments?.length ? payments.map((p: any) => (
                                    <div key={p.id} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium">{monthNames[p.month]} {p.year}</p>
                                            <p className="text-sm text-muted-foreground">Rp {p.amount?.toLocaleString('id-ID')}</p>
                                        </div>
                                        <Badge variant={p.status === 'paid' ? 'default' : 'secondary'}
                                            className={p.status === 'paid' ? 'bg-green-100 text-green-800 border-none' : ''}>
                                            {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Pending'}
                                        </Badge>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">Belum ada riwayat pembayaran.</p>
                                )}
                            </div>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Periode</TableHead>
                                            <TableHead>Jumlah</TableHead>
                                            <TableHead>Tanggal Bayar</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Catatan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments?.length ? payments.map((p: any) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{monthNames[p.month]} {p.year}</TableCell>
                                                <TableCell>Rp {p.amount?.toLocaleString('id-ID')}</TableCell>
                                                <TableCell>{new Date(p.payment_date).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>
                                                    <Badge className={
                                                        p.status === 'paid' ? 'bg-green-100 text-green-800 border-none' :
                                                            p.status === 'partial' ? 'bg-yellow-100 text-yellow-800 border-none' :
                                                                'bg-red-100 text-red-800 border-none'
                                                    }>
                                                        {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Pending'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{p.notes || '-'}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="text-center text-muted-foreground h-24">
                                                    Belum ada riwayat pembayaran.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PERIZINAN TAB */}
                <TabsContent value="permissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Perizinan</CardTitle>
                            <CardDescription>Pengajuan perizinan santri</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="space-y-3 md:hidden">
                                {permissions?.length ? permissions.map((p: any) => (
                                    <div key={p.id} className="bg-slate-50 rounded-lg p-3">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="font-medium">{typeLabels[p.type] || p.type}</span>
                                            <Badge className={permissionStatusColors[p.status] || ''}>
                                                {permissionStatusLabels[p.status] || p.status}
                                            </Badge>
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(p.start_date).toLocaleDateString('id-ID')}
                                            {p.start_date !== p.end_date && ` - ${new Date(p.end_date).toLocaleDateString('id-ID')}`}
                                        </p>
                                        {p.reason && <p className="text-sm mt-1 truncate">{p.reason}</p>}
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">Belum ada riwayat perizinan.</p>
                                )}
                            </div>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Alasan</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissions?.length ? permissions.map((p: any) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="font-medium">{typeLabels[p.type] || p.type}</TableCell>
                                                <TableCell>
                                                    {new Date(p.start_date).toLocaleDateString('id-ID')}
                                                    {p.start_date !== p.end_date && ` - ${new Date(p.end_date).toLocaleDateString('id-ID')}`}
                                                </TableCell>
                                                <TableCell className="max-w-[250px] truncate">{p.reason || '-'}</TableCell>
                                                <TableCell>
                                                    <Badge className={permissionStatusColors[p.status] || ''}>
                                                        {permissionStatusLabels[p.status] || p.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center text-muted-foreground h-24">
                                                    Belum ada riwayat perizinan.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* ABSENSI TAB */}
                <TabsContent value="attendance" className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
                        <Card>
                            <CardContent className="pt-4 pb-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-green-700">{attendancePresent}</div>
                                    <p className="text-xs text-muted-foreground">Hadir</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-yellow-600">{attendanceSick}</div>
                                    <p className="text-xs text-muted-foreground">Sakit</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-600">{attendancePermission}</div>
                                    <p className="text-xs text-muted-foreground">Izin</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardContent className="pt-4 pb-3">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-red-600">{attendanceAlpha}</div>
                                    <p className="text-xs text-muted-foreground">Alpha</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Absensi</CardTitle>
                            <CardDescription>Data kehadiran harian santri</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Mobile Cards */}
                            <div className="space-y-3 md:hidden">
                                {attendance?.length ? attendance.map((a: any) => (
                                    <div key={a.id} className="bg-slate-50 rounded-lg p-3 flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-sm">
                                                {new Date(a.date).toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
                                            </p>
                                            {a.notes && <p className="text-xs text-muted-foreground mt-0.5">{a.notes}</p>}
                                        </div>
                                        <Badge className={attendanceStatusColors[a.status] || ''}>
                                            {attendanceStatusLabels[a.status] || a.status}
                                        </Badge>
                                    </div>
                                )) : (
                                    <p className="text-center text-muted-foreground py-8">Belum ada data absensi.</p>
                                )}
                            </div>
                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Catatan</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {attendance?.length ? attendance.map((a: any) => (
                                            <TableRow key={a.id}>
                                                <TableCell className="font-medium">
                                                    {new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={attendanceStatusColors[a.status] || ''}>
                                                        {attendanceStatusLabels[a.status] || a.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground">{a.notes || '-'}</TableCell>
                                            </TableRow>
                                        )) : (
                                            <TableRow>
                                                <TableCell colSpan={3} className="text-center text-muted-foreground h-24">
                                                    Belum ada data absensi.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* PROFIL TAB */}
                <TabsContent value="profile" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Informasi Lengkap</CardTitle>
                            <CardDescription>Data profil santri</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama Lengkap</p>
                                        <p className="font-medium">{santri.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">NIS</p>
                                        <p className="font-medium font-mono">{santri.nis}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Jenis Kelamin</p>
                                        <p className="font-medium">{santri.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Kelas</p>
                                        <p className="font-medium">{santri.class}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Asrama</p>
                                        <p className="font-medium">{santri.dorm || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Alamat Asal</p>
                                        <p className="font-medium">{santri.origin_address || '-'}</p>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Nama Wali</p>
                                        <p className="font-medium">{santri.guardian_name || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">No. HP Wali</p>
                                        <p className="font-medium">{santri.guardian_phone || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Program/Jurusan</p>
                                        {santri.program ? (
                                            <Badge variant="outline" className="mt-0.5">
                                                {isTahfidz ? '📖' : isDiniyah ? '📚' : '💼'} {santri.program}
                                            </Badge>
                                        ) : (
                                            <p className="font-medium text-muted-foreground">Belum ditentukan</p>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Status</p>
                                        <Badge className={statusColors[santri.status as string] || ''}>
                                            {statusLabels[santri.status as string] || santri.status}
                                        </Badge>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Terdaftar Sejak</p>
                                        <p className="font-medium">{new Date(santri.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
