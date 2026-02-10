import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ArrowLeft, User, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { PermissionDialog } from '@/components/permissions/permission-dialog'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    sick: { label: 'Sakit', color: 'bg-red-100 text-red-800' },
    permit: { label: 'Izin', color: 'bg-blue-100 text-blue-800' },
    late: { label: 'Terlambat', color: 'bg-orange-100 text-orange-800' },
    other: { label: 'Lainnya', color: 'bg-gray-100 text-gray-800' },
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    approved: { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800', icon: XCircle },
}

export default async function SantriPermissionHistoryPage({
    params,
}: {
    params: Promise<{ santriId: string }>
}) {
    const { santriId } = await params
    const supabase = await createClient()

    // Fetch santri data
    const { data: santri, error } = await supabase
        .from('santri')
        .select('*')
        .eq('id', santriId)
        .single()

    if (error || !santri) {
        notFound()
    }

    // Fetch all permissions for this santri
    const { data: permissions } = await supabase
        .from('permissions')
        .select('*')
        .eq('santri_id', santriId)
        .order('created_at', { ascending: false })

    // Calculate stats
    const currentYear = new Date().getFullYear()
    const thisYearPermissions = permissions?.filter(p => new Date(p.start_date).getFullYear() === currentYear) || []

    const sickDays = thisYearPermissions
        .filter(p => p.type === 'sick' && p.status === 'approved')
        .reduce((sum, p) => sum + getDuration(p.start_date, p.end_date), 0)

    const permitDays = thisYearPermissions
        .filter(p => p.type === 'permit' && p.status === 'approved')
        .reduce((sum, p) => sum + getDuration(p.start_date, p.end_date), 0)

    const lateDays = thisYearPermissions
        .filter(p => p.type === 'late' && p.status === 'approved').length

    const pendingCount = thisYearPermissions.filter(p => p.status === 'pending').length

    // Get santri list for the dialog (just this one for quick add)
    const santriList = [{ id: santri.id, name: santri.name, nis: santri.nis }]

    // Group permissions by month for timeline
    const permissionsByMonth: Record<string, any[]> = {}
    permissions?.forEach(p => {
        const monthKey = new Date(p.start_date).toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
        if (!permissionsByMonth[monthKey]) {
            permissionsByMonth[monthKey] = []
        }
        permissionsByMonth[monthKey].push(p)
    })

    function getDuration(start: string, end: string) {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/permissions">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Riwayat Perizinan</h2>
                        <p className="text-muted-foreground">{santri.name} ({santri.nis}) • {santri.class}</p>
                    </div>
                </div>
                <PermissionDialog santriList={santriList} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Info Santri</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{santri.class}</div>
                        <p className="text-xs text-muted-foreground">{santri.dorm || 'Asrama belum ditentukan'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hari Sakit</CardTitle>
                        <AlertCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{sickDays}</div>
                        <p className="text-xs text-muted-foreground">hari di {currentYear}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Hari Izin</CardTitle>
                        <Calendar className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{permitDays}</div>
                        <p className="text-xs text-muted-foreground">hari di {currentYear}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Keterlambatan</CardTitle>
                        <Clock className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-orange-600">{lateDays}</div>
                        <p className="text-xs text-muted-foreground">kali di {currentYear}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menunggu</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
                        <p className="text-xs text-muted-foreground">perlu approval</p>
                    </CardContent>
                </Card>
            </div>

            {/* Permission Timeline by Month */}
            <div className="space-y-4">
                {Object.entries(permissionsByMonth).map(([month, monthPermissions]) => (
                    <Card key={month}>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">{month}</CardTitle>
                            <CardDescription>{monthPermissions.length} perizinan</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Tanggal</TableHead>
                                        <TableHead>Jenis</TableHead>
                                        <TableHead>Alasan</TableHead>
                                        <TableHead>Durasi</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Dibuat</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {monthPermissions.map((p: any) => {
                                        const typeConfig = TYPE_LABELS[p.type] || TYPE_LABELS.other
                                        const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                                        const StatusIcon = statusConfig.icon
                                        const duration = getDuration(p.start_date, p.end_date)

                                        return (
                                            <TableRow key={p.id} className={p.status === 'pending' ? 'bg-yellow-50/50' : ''}>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">
                                                            {new Date(p.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                        </span>
                                                        {p.start_date !== p.end_date && (
                                                            <span className="text-xs text-muted-foreground">
                                                                s/d {new Date(p.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={typeConfig.color} variant="secondary">
                                                        {typeConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[250px]">
                                                    <p className="truncate" title={p.reason}>{p.reason}</p>
                                                </TableCell>
                                                <TableCell>{duration} hari</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusIcon className="h-4 w-4" />
                                                        <Badge className={statusConfig.color} variant="secondary">
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground text-sm">
                                                    {new Date(p.created_at).toLocaleDateString('id-ID', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(permissionsByMonth).length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Belum Ada Riwayat Perizinan</h3>
                            <p className="text-muted-foreground">Santri ini belum pernah mengajukan izin.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Summary Table */}
            {permissions && permissions.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Kehadiran {currentYear}</CardTitle>
                        <CardDescription>Total hari tidak hadir berdasarkan jenis</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                            {Object.entries(TYPE_LABELS).map(([type, config]) => {
                                const count = thisYearPermissions
                                    .filter(p => p.type === type && p.status === 'approved')
                                    .reduce((sum, p) => sum + getDuration(p.start_date, p.end_date), 0)
                                return (
                                    <div key={type} className={`rounded-lg p-4 ${config.color}`}>
                                        <div className="text-2xl font-bold">{count}</div>
                                        <div className="text-sm font-medium">{config.label}</div>
                                        <div className="text-xs opacity-75">hari</div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
