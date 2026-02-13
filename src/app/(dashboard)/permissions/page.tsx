import { createAdminClient } from '@/lib/supabase/admin'
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
import { ChevronLeft, ChevronRight, Search, Clock, CheckCircle, XCircle, AlertCircle, Calendar, Users, AlertTriangle, ArrowRight } from 'lucide-react'
import { PaginationLimit } from '@/components/layout/pagination-limit'

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
    pulang: { label: 'Pulang', color: 'bg-blue-100 text-blue-800' },
    kegiatan_luar: { label: 'Kegiatan Luar', color: 'bg-indigo-100 text-indigo-800' },
    organisasi: { label: 'Organisasi', color: 'bg-purple-100 text-purple-800' },
    sick: { label: 'Sakit', color: 'bg-red-100 text-red-800' }, // Keep for backward compatibility
    permit: { label: 'Izin', color: 'bg-orange-100 text-orange-800' }, // Keep for backward compatibility
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
    pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    berlangsung: { label: 'Berlangsung', color: 'bg-blue-100 text-blue-800', icon: ArrowRight },
    selesai: { label: 'Selesai', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    terlambat: { label: 'Terlambat', color: 'bg-red-100 text-red-800', icon: AlertTriangle },
    approved: { label: 'Disetujui', color: 'bg-green-100 text-green-800', icon: CheckCircle }, // Backward compat
    rejected: { label: 'Ditolak', color: 'bg-gray-100 text-gray-800', icon: XCircle }, // Backward compat
}

export default async function PermissionsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; status?: string; limit?: string }>
}) {
    const params = await searchParams
    const supabase = createAdminClient() // Use Admin Client to bypass RLS
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 15
    const from = (page - 1) * limit
    const to = from + limit - 1
    const statusFilter = params.status || 'all'

    // Build query with status filter
    let baseQuery = supabase
        .from('permissions')
        .select('*, santri(id, name, nis, class, dorm)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (statusFilter !== 'all') {
        baseQuery = baseQuery.eq('status', statusFilter)
    }

    if (params.q) {
        baseQuery = baseQuery.ilike('reason', `%${params.q}%`)
    }

    // Parallelize all data fetching
    const [
        { data: santriList },
        { data: permissions, count },
        { count: pendingCount },
        { count: activeCount },
        { count: lateCount },
        { count: finishedCount }
    ] = await Promise.all([
        // 1. Fetch Santri List
        supabase.from('santri').select('id, name, nis, class, dorm').eq('status', 'active').order('name'),
        // 2. Fetch Main Permissions Data
        baseQuery,
        // 3. Fetch Counts (Head Only)
        supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('status', 'berlangsung'),
        supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('status', 'terlambat'),
        supabase.from('permissions').select('*', { count: 'exact', head: true }).eq('status', 'selesai')
    ])

    const totalPages = count ? Math.ceil(count / limit) : 0

    // Check permission counts for displayed santris
    const santriIds = permissions?.map((p: any) => p.santri_id) || []
    let permissionCounts: Record<string, number> = {}

    if (santriIds.length > 0) {
        // This query depends on permissions being fetched first, so it stays separate
        const { data: pCounts } = await supabase
            .from('permissions')
            .select('santri_id')
            .in('santri_id', santriIds)

        if (pCounts) {
            pCounts.forEach((p: any) => {
                permissionCounts[p.santri_id] = (permissionCounts[p.santri_id] || 0) + 1
            })
        }
    }

    // Build URL helper
    const buildUrl = (newParams: Record<string, string | number>) => {
        const urlParams = new URLSearchParams()
        const merged = { page: params.page, q: params.q, status: params.status, ...newParams }
        Object.entries(merged).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') urlParams.set(k, String(v))
        })
        return `/permissions?${urlParams.toString()}`
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-emerald-800">Perizinan Santri</h2>
                <PermissionDialog santriList={santriList || []} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card className={statusFilter === 'berlangsung' ? 'ring-2 ring-blue-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Berlangsung</CardTitle>
                        <ArrowRight className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-blue-600">{activeCount || 0}</div>
                    </CardContent>
                </Card>
                <Card className={statusFilter === 'selesai' ? 'ring-2 ring-green-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Selesai</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        {/* We need to fetch finished count, adding it below */}
                        <div className="text-xl md:text-2xl font-bold text-green-600">{finishedCount || 0}</div>
                    </CardContent>
                </Card>
                <Card className={statusFilter === 'terlambat' ? 'ring-2 ring-red-500' : ''}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Terlambat</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-red-600">{lateCount || 0}</div>
                    </CardContent>
                </Card>
                {/* Placeholder/Total Card */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Izin</CardTitle>
                        <Users className="h-4 w-4 text-slate-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold text-slate-600">{count || 0}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Filter Tabs */}
            <Tabs value={statusFilter} className="space-y-4">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <TabsList className="grid grid-cols-4 w-full md:w-auto h-auto">
                        <TabsTrigger value="all" asChild className="py-2">
                            <Link href={buildUrl({ status: '', page: 1 })}>Semua</Link>
                        </TabsTrigger>
                        <TabsTrigger value="pending" asChild className="py-2">
                            <Link href={buildUrl({ status: 'pending', page: 1 })}>Menunggu</Link>
                        </TabsTrigger>
                        <TabsTrigger value="berlangsung" asChild className="py-2">
                            <Link href={buildUrl({ status: 'berlangsung', page: 1 })}>Berlangsung</Link>
                        </TabsTrigger>
                        <TabsTrigger value="terlambat" asChild className="py-2">
                            <Link href={buildUrl({ status: 'terlambat', page: 1 })}>Terlambat</Link>
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
                            {/* Mobile View */}
                            <div className="grid grid-cols-1 gap-4 md:hidden px-4 pb-4">
                                {permissions?.length ? (
                                    permissions.map((p: any) => {
                                        const typeConfig = TYPE_LABELS[p.type] || { label: p.type, color: 'bg-gray-100 text-gray-800' }
                                        const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                                        const pCount = permissionCounts[p.santri_id] || 0
                                        const isWarning = pCount > 4

                                        return (
                                            <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1.5">
                                                        <Link href={`/santri/${p.santri?.id}`} className="hover:underline">
                                                            <h4 className="font-bold text-slate-900">{p.santri?.name}</h4>
                                                        </Link>
                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1 rounded">{p.santri?.nis}</span>
                                                            <Badge variant="outline" className={`${typeConfig.color} text-[10px] h-5 border-none px-1.5 font-bold`}>
                                                                {typeConfig.label}
                                                            </Badge>
                                                        </div>
                                                    </div>
                                                    <Badge className={`${statusConfig.color} border-none font-bold py-1 px-3`}>
                                                        {statusConfig.label}
                                                    </Badge>
                                                </div>

                                                <div className="space-y-2 py-3 border-y border-slate-50">
                                                    <div className="flex items-center gap-2 text-xs text-slate-600">
                                                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                                        <span className="font-medium">
                                                            {new Date(p.start_date).toLocaleDateString('id-ID')} - {new Date(p.end_date).toLocaleDateString('id-ID')}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-xs text-slate-500">
                                                        <AlertCircle className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
                                                        <p className="italic line-clamp-2">{p.reason}</p>
                                                    </div>
                                                    {isWarning && (
                                                        <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 bg-red-50 p-1.5 rounded-lg border border-red-100">
                                                            <AlertTriangle className="w-3.5 h-3.5" />
                                                            Sudah Izin {pCount}x
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex justify-center pt-1">
                                                    <PermissionActions id={p.id} status={p.status} data={p} />
                                                </div>
                                            </div>
                                        )
                                    })
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed text-muted-foreground">
                                        Tidak ada data perizinan.
                                    </div>
                                )}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Santri</TableHead>
                                            <TableHead>Jenis Izin</TableHead>
                                            <TableHead>Waktu</TableHead>
                                            <TableHead className="hidden lg:table-cell">Alasan</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {permissions?.length ? (
                                            permissions.map((p: any) => {
                                                const typeConfig = TYPE_LABELS[p.type] || { label: p.type, color: 'bg-gray-100 text-gray-800' }
                                                const statusConfig = STATUS_CONFIG[p.status] || STATUS_CONFIG.pending
                                                const pCount = permissionCounts[p.santri_id] || 0
                                                const isWarning = pCount > 4

                                                return (
                                                    <TableRow key={p.id}>
                                                        <TableCell>
                                                            <Link href={`/santri/${p.santri?.id}`} className="hover:underline cursor-pointer">
                                                                <div className="font-semibold text-slate-900">{p.santri?.name}</div>
                                                            </Link>
                                                            <div className="text-[10px] text-muted-foreground font-mono flex items-center gap-2">
                                                                {p.santri?.nis}
                                                                {isWarning && (
                                                                    <span className="text-red-500 flex items-center gap-1 font-bold bg-red-50 px-1 rounded">
                                                                        <AlertCircle size={10} />
                                                                        {pCount}x Izin
                                                                    </span>
                                                                )}
                                                            </div>
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
                                                            <Badge className={`${statusConfig.color} hover:${statusConfig.color} border-none`}>
                                                                <statusConfig.icon className="w-3 h-3 mr-1" />
                                                                {statusConfig.label}
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <PermissionActions id={p.id} status={p.status} data={p} />
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
                        <div className="flex justify-center md:ml-4">
                            <PaginationLimit currentLimit={limit} />
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
