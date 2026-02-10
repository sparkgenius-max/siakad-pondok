import { createClient } from '@/lib/supabase/server'
import { PermissionDialog } from '@/components/permissions/permission-dialog'
import { PermissionActions } from '@/components/permissions/permission-actions'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Users } from 'lucide-react'

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

export default async function PermissionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; status?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = 15
    const from = (page - 1) * limit
    const to = from + limit - 1
    const statusFilter = params.status || 'all'

    // Fetch santri list for dialog
    const { data: santriList } = await supabase
        .from('santri')
        .select('id, name, nis')
        .eq('status', 'active')
        .order('name')

    // Build query with status filter
    let query = supabase
        .from('permissions')
        .select('*, santri(id, name, nis, class, dorm)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
    }

    if (params.q) {
        query = query.ilike('reason', `%${params.q}%`)
    }

    const { data: permissions, count } = await query
    const totalPages = count ? Math.ceil(count / limit) : 0

    // Get counts for each status
    const { count: pendingCount } = await supabase
        .from('permissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

    const { count: approvedCount } = await supabase
        .from('permissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved')

    const { count: rejectedCount } = await supabase
        .from('permissions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'rejected')

    // Get today's active permissions (approved and ongoing)
    const today = new Date().toISOString().split('T')[0]
    const { data: activePermissions } = await supabase
        .from('permissions')
        .select('*, santri(name, nis, class)')
        .eq('status', 'approved')
        .lte('start_date', today)
        .gte('end_date', today)

    // Build URL helper
    const buildUrl = (newParams: Record<string, string | number>) => {
        const urlParams = new URLSearchParams()
        const merged = { page: params.page, q: params.q, status: params.status, ...newParams }
        Object.entries(merged).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') urlParams.set(k, String(v))
        })
        return `/permissions?${urlParams.toString()}`
    }

    // Calculate days between dates
    const getDuration = (start: string, end: string) => {
        const startDate = new Date(start)
        const endDate = new Date(end)
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays + 1
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Perizinan Santri</h2>
                <PermissionDialog santriList={santriList || []} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card className={statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Menunggu Approval</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-600">{pendingCount || 0}</div>
                        <Link href={buildUrl({ status: 'pending', page: 1 })} className="text-xs text-muted-foreground hover:underline">
                            View pending →
                        </Link>
                    </CardContent>
                </Card>
                <Card className={statusFilter === 'approved' ? 'ring-2 ring-green-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Disetujui</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{approvedCount || 0}</div>
                        <Link href={buildUrl({ status: 'approved', page: 1 })} className="text-xs text-muted-foreground hover:underline">
                            View approved →
                        </Link>
                    </CardContent>
                </Card>
                <Card className={statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Ditolak</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{rejectedCount || 0}</div>
                        <Link href={buildUrl({ status: 'rejected', page: 1 })} className="text-xs text-muted-foreground hover:underline">
                            View rejected →
                        </Link>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Sedang Izin Hari Ini</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{activePermissions?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">santri tidak hadir</p>
                    </CardContent>
                </Card>
            </div>

            {/* Currently Active Permissions */}
            {activePermissions && activePermissions.length > 0 && (
                <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            Santri Sedang Izin Hari Ini
                        </CardTitle>
                        <CardDescription>Daftar santri yang sedang dalam masa izin</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {activePermissions.map((p: any) => (
                                <div key={p.id} className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border">
                                    <div>
                                        <div className="font-medium text-sm">{p.santri?.name}</div>
                                        <div className="text-xs text-muted-foreground">{p.santri?.class} • {TYPE_LABELS[p.type]?.label}</div>
                                    </div>
                                    <Badge variant="outline" className="ml-2">
                                        {getDuration(p.start_date, p.end_date)} hari
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Filter Tabs */}
            <Tabs defaultValue={statusFilter} className="space-y-4">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="all" asChild>
                            <Link href={buildUrl({ status: '', page: 1 })}>Semua</Link>
                        </TabsTrigger>
                        <TabsTrigger value="pending" asChild>
                            <Link href={buildUrl({ status: 'pending', page: 1 })}>
                                Pending {pendingCount ? `(${pendingCount})` : ''}
                            </Link>
                        </TabsTrigger>
                        <TabsTrigger value="approved" asChild>
                            <Link href={buildUrl({ status: 'approved', page: 1 })}>Approved</Link>
                        </TabsTrigger>
                        <TabsTrigger value="rejected" asChild>
                            <Link href={buildUrl({ status: 'rejected', page: 1 })}>Rejected</Link>
                        </TabsTrigger>
                    </TabsList>

                    <form className="flex items-center space-x-2">
                        <input type="hidden" name="status" value={statusFilter} />
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="q"
                                type="search"
                                placeholder="Search reason..."
                                className="pl-8 w-[200px]"
                                defaultValue={params.q}
                            />
                        </div>
                        <Button type="submit" variant="secondary" size="sm">Search</Button>
                    </form>
                </div>

                {/* Permissions Table */}
                <Card>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[50px]">#</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Santri</TableHead>
                                    <TableHead>Jenis</TableHead>
                                    <TableHead>Alasan</TableHead>
                                    <TableHead>Durasi</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {permissions?.length ? (
                                    permissions.map((p: any, index: number) => {
                                        const typeConfig = TYPE_LABELS[p.type] || TYPE_LABELS.other
                                        const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                                        const StatusIcon = statusConfig.icon
                                        const duration = getDuration(p.start_date, p.end_date)

                                        return (
                                            <TableRow key={p.id} className={p.status === 'pending' ? 'bg-yellow-50/50' : ''}>
                                                <TableCell className="text-muted-foreground">
                                                    {from + index + 1}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{new Date(p.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}</span>
                                                        {p.start_date !== p.end_date && (
                                                            <span className="text-xs text-muted-foreground">
                                                                s/d {new Date(p.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Link href={`/permissions/santri/${p.santri?.id}`} className="hover:underline">
                                                        <div className="font-medium">{p.santri?.name}</div>
                                                        <div className="text-xs text-muted-foreground">{p.santri?.class} • {p.santri?.nis}</div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={typeConfig.color} variant="secondary">
                                                        {typeConfig.label}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px]">
                                                    <p className="truncate" title={p.reason}>{p.reason}</p>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="text-sm">{duration} hari</span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1.5">
                                                        <StatusIcon className="h-4 w-4" />
                                                        <Badge className={statusConfig.color} variant="secondary">
                                                            {statusConfig.label}
                                                        </Badge>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <PermissionActions id={p.id} status={p.status} />
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            <div className="flex flex-col items-center gap-2">
                                                <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                                <p>Tidak ada data perizinan</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                        Menampilkan {permissions?.length || 0} dari {count || 0} data
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                            {page > 1 ? (
                                <Link href={buildUrl({ page: page - 1 })} className="flex items-center">
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Sebelumnya
                                </Link>
                            ) : (
                                <span className="flex items-center">
                                    <ChevronLeft className="h-4 w-4 mr-1" />
                                    Sebelumnya
                                </span>
                            )}
                        </Button>
                        <div className="text-sm">Halaman {page} dari {totalPages || 1}</div>
                        <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
                            {page < totalPages ? (
                                <Link href={buildUrl({ page: page + 1 })} className="flex items-center">
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Link>
                            ) : (
                                <span className="flex items-center">
                                    Selanjutnya
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </Tabs>
        </div>
    )
}
