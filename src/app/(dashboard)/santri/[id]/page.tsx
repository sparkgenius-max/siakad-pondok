import { createClient } from '@/lib/supabase/server'
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
import { ArrowLeft, User, Phone, Home, GraduationCap } from 'lucide-react'

export default async function SantriDetailPage({
    params,
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const supabase = await createClient()

    // Fetch santri data
    const { data: santri, error } = await supabase
        .from('santri')
        .select('*')
        .eq('id', id)
        .single()

    if (error || !santri) {
        notFound()
    }

    // Fetch related data
    const [{ data: payments }, { data: permissions }, { data: grades }] = await Promise.all([
        supabase
            .from('payments')
            .select('*')
            .eq('santri_id', id)
            .order('year', { ascending: false })
            .order('month', { ascending: false })
            .limit(10),
        supabase
            .from('permissions')
            .select('*')
            .eq('santri_id', id)
            .order('created_at', { ascending: false })
            .limit(10),
        supabase
            .from('grades')
            .select('*')
            .eq('santri_id', id)
            .order('academic_year', { ascending: false })
            .limit(10),
    ])

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

    const statusColor = statusColors[santri.status as string] || 'bg-gray-100 text-gray-800'

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild title="Kembali">
                    <Link href="/santri">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{santri.name}</h2>
                    <p className="text-muted-foreground">NIS: {santri.nis}</p>
                </div>
                <Badge className={statusColor}>
                    {statusLabels[santri.status as string] || santri.status}
                </Badge>
            </div>

            {/* Profile Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kelas</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{santri.class}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Asrama</CardTitle>
                        <Home className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{santri.dorm || '-'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Wali Santri</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-medium">{santri.guardian_name || '-'}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">No. HP Wali</CardTitle>
                        <Phone className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-medium">{santri.guardian_phone || '-'}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs for related data */}
            <Tabs defaultValue="payments" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="payments">Pembayaran ({payments?.length || 0})</TabsTrigger>
                    <TabsTrigger value="permissions">Perizinan ({permissions?.length || 0})</TabsTrigger>
                    <TabsTrigger value="grades">Nilai ({grades?.length || 0})</TabsTrigger>
                </TabsList>

                <TabsContent value="payments" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Pembayaran</CardTitle>
                            <CardDescription>Pembayaran syahriah terbaru untuk santri ini</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Periode</TableHead>
                                        <TableHead>Jumlah</TableHead>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {payments?.length ? (
                                        payments.map((p: any) => (
                                            <TableRow key={p.id}>
                                                <TableCell>{p.month}/{p.year}</TableCell>
                                                <TableCell>Rp {p.amount?.toLocaleString('id-ID')}</TableCell>
                                                <TableCell>{new Date(p.payment_date).toLocaleDateString('id-ID')}</TableCell>
                                                <TableCell>
                                                    <Badge variant={p.status === 'paid' ? 'default' : 'secondary'}>
                                                        {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : p.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                Riwayat pembayaran tidak ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="permissions" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Perizinan</CardTitle>
                            <CardDescription>Pengajuan perizinan terbaru</CardDescription>
                        </CardHeader>
                        <CardContent>
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
                                    {permissions?.length ? (
                                        permissions.map((p: any) => (
                                            <TableRow key={p.id}>
                                                <TableCell className="capitalize">
                                                    {p.type === 'sick' ? 'Sakit' : p.type === 'permit' ? 'Izin' : p.type === 'late' ? 'Terlambat' : p.type}
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(p.start_date).toLocaleDateString('id-ID')}
                                                    {p.start_date !== p.end_date && ` - ${new Date(p.end_date).toLocaleDateString('id-ID')}`}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">{p.reason}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={p.status === 'approved' ? 'default' : p.status === 'rejected' ? 'destructive' : 'secondary'}
                                                    >
                                                        {p.status === 'approved' ? 'Disetujui' : p.status === 'rejected' ? 'Ditolak' : 'Pending'}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                Riwayat perizinan tidak ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="grades" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Nilai Akademik</CardTitle>
                            <CardDescription>Performa akademik santri</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead>Nilai</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Tahun Ajaran</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grades?.length ? (
                                        grades.map((g: any) => (
                                            <TableRow key={g.id}>
                                                <TableCell>{g.subject}</TableCell>
                                                <TableCell className="font-bold">{g.grade}</TableCell>
                                                <TableCell>{g.semester}</TableCell>
                                                <TableCell>{g.academic_year}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-muted-foreground">
                                                Catatan nilai tidak ditemukan.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
