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
import { PaginationLimit } from '@/components/layout/pagination-limit'

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
    searchParams: Promise<{ page?: string; q?: string; status?: string; limit?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 15
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
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className={statusFilter === 'pending' ? 'ring-2 ring-yellow-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Menunggu</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-yellow-600">{pendingCount || 0}</div>
                    </CardContent>
                </Card>
                <Card className={statusFilter === 'approved' ? 'ring-2 ring-green-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Disetujui</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-green-600">{approvedCount || 0}</div>
                    </CardContent>
                </Card>
                <Card className={statusFilter === 'rejected' ? 'ring-2 ring-red-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Ditolak</CardTitle>
                        <XCircle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-red-600">{rejectedCount || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Aktif Izin</CardTitle>
                        <Users className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-blue-600">{activePermissions?.length || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Tabs defaultValue={statusFilter} className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <TabsList className="grid grid-cols-4 w-full md:w-auto">
                        <TabsTrigger value="all" asChild>
                            <Link href={buildUrl({ status: '', page: 1 })}>Semua</Link>
                        </TabsTrigger>
                        <TabsTrigger value="pending" asChild>
                            <Link href={buildUrl({ status: 'pending', page: 1 })}>Pending</Link>
                        </TabsTrigger>
                        <TabsTrigger value="approved" asChild>
                            <Link href={buildUrl({ status: 'approved', page: 1 })}>Approved</Link>
                        </TabsTrigger>
                        <TabsTrigger value="rejected" asChild>
                            <Link href={buildUrl({ status: 'rejected', page: 1 })}>Rejected</Link>
                        </TabsTrigger>
                    </TabsList>

                    <form className="flex items-center space-x-2">
                        <div className="relative w-full md:w-auto">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                name="q"
                                type="search"
                                placeholder="Cari alasan..."
                                className="pl-8 w-full md:w-[250px]"
                                defaultValue={params.q}
                            />
                        </div>
                        <Button type="submit" variant="secondary">Cari</Button>
                    </form>
                </div>

                <TabsContent value={statusFilter} className="space-y-4">
                    <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                        <CardContent className="p-0">
                            {/* Mobile Card List */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {permissions?.length ? (
                                    permissions.map((p: any) => {
                                        const typeConfig = TYPE_LABELS[p.type] || TYPE_LABELS.other
                                        return (
                                            <div key={p.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-slate-900">{p.santri?.name}</h4>
                                                        <div className="flex items-center gap-2">
                                                            <Badge variant="outline" className={`${typeConfig.color} text-[10px] h-5 border-none px-1.5`}>
                                                                {typeConfig.label}
                                                            </Badge>
                                                            <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1 rounded">{p.santri?.nis}</span>
                                                        </div>
                                                    </div>
                                                    <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}
                                                        className={p.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-none' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none' : ''}>
                                                        {p.status === 'approved' ? 'Disetujui' : p.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                                    </Badge>
                                                </div>

                                                <div className="flex flex-col gap-1 py-1">
                                                    <p className="text-xs text-muted-foreground">Alasan: <span className="text-slate-700 font-medium italic">"{p.reason}"</span></p>
                                                    <p className="text-xs text-muted-foreground">Periode: <span className="text-slate-700 font-medium">{new Date(p.start_date).toLocaleDateString('id-ID')} - {new Date(p.end_date).toLocaleDateString('id-ID')}</span></p>
                                                </div>

                                                <div className="flex justify-end pt-2 border-t border-slate-50">
                                                    <PermissionActions id={p.id} status={p.status} />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border">
                                        <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                                        <p className="text-muted-foreground font-medium">Tidak ada data perizinan</p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Santri</TableHead>
                                            <TableHead>Jenis</TableHead>
                                            <TableHead>Tanggal</TableHead>
                                            <TableHead className="hidden lg:table-cell">Alasan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissions?.length ? (
                                            permissions.map((p: any) => {
                                                const typeConfig = TYPE_LABELS[p.type] || TYPE_LABELS.other
                                                return (
                                                    <TableRow key={p.id}>
                                                        <TableCell>
                                                            <div className="font-semibold text-slate-900">{p.santri?.name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">{p.santri?.nis}</div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="outline" className={`${typeConfig.color} border-none`}>
                                                                {typeConfig.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="whitespace-nowrap text-xs">
                                                            {new Date(p.start_date).toLocaleDateString('id-ID')} - {new Date(p.end_date).toLocaleDateString('id-ID')}
                                                        </TableCell>
                                                        <TableCell className="hidden lg:table-cell max-w-[200px] truncate text-xs text-muted-foreground italic">
                                                            {p.reason}
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant={p.status === 'approved' ? 'default' : p.status === 'pending' ? 'secondary' : 'destructive'}
                                                                className={p.status === 'approved' ? 'bg-green-100 text-green-700 hover:bg-green-100' : p.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100' : ''}>
                                                                {p.status === 'approved' ? 'Disetujui' : p.status === 'pending' ? 'Menunggu' : 'Ditolak'}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <PermissionActions id={p.id} status={p.status} />
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            })
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} className="h-24 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <AlertCircle className="h-8 w-8 text-muted-foreground" />
                                                        <p className="text-muted-foreground">Tidak ada data perizinan</p>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                                Menampilkan <span className="font-medium text-slate-900">{permissions?.length || 0}</span> dari <span className="font-medium text-slate-900">{count || 0}</span> data
                            </p>
                            <div className="flex justify-center md:ml-4">
                                <PaginationLimit currentLimit={limit} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1} className="h-9 px-4 rounded-lg">
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
                            <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                                {page} / {totalPages || 1}
                            </div>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages} className="h-9 px-4 rounded-lg">
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
                </TabsContent>
            </Tabs>
        </div>
    )
}
