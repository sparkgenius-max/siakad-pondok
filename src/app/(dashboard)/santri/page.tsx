import { createAdminClient } from '@/lib/supabase/admin'
import { SantriDialog } from '@/components/santri/santri-dialog'
import { SantriImportDialog } from '@/components/santri/santri-import-dialog'
import { SantriActions } from '@/components/santri/santri-actions'
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
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { PaginationLimit } from '@/components/layout/pagination-limit'

export const dynamic = 'force-dynamic'

export default async function SantriPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; limit?: string; program?: string }>
}) {
    const params = await searchParams
    const supabase = createAdminClient()
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 10
    const program = params.program || 'all'
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Fetch santri
    let query = supabase
        .from('santri')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (params.q) {
        query = query.or(`name.ilike.%${params.q}%,nis.ilike.%${params.q}%`)
    }

    if (program !== 'all') {
        query = query.eq('program', program)
    }

    const { data: santri, count } = await query

    const totalPages = count ? Math.ceil(count / limit) : 0

    // Build URL helper for pagination
    const buildUrl = (p: number) => {
        const urlParams = new URLSearchParams()
        if (p > 1) urlParams.set('page', String(p))
        if (params.q) urlParams.set('q', params.q)
        if (program !== 'all') urlParams.set('program', program)
        if (limit !== 10) urlParams.set('limit', String(limit))
        return `/santri?${urlParams.toString()}`
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Manajemen Santri</h2>
                <div className="flex items-center gap-2">
                    <SantriImportDialog />
                    <SantriDialog />
                </div>
            </div>

            {/* Search & Filter */}
            <div className="flex flex-col md:flex-row gap-4 mt-2">
                <form className="flex-1 flex items-center gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="q"
                            placeholder="Cari nama atau NIS..."
                            className="pl-9 bg-white"
                            defaultValue={params.q}
                        />
                        {limit !== 10 && <input type="hidden" name="limit" value={limit} />}
                        {program !== 'all' && <input type="hidden" name="program" value={program} />}
                    </div>
                    <Button type="submit" variant="secondary" className="shrink-0">Cari</Button>
                </form>

                <div className="flex items-center gap-2">
                    <div className="flex items-center bg-white border rounded-lg p-1">
                        <Link
                            href={`/santri?program=all${params.q ? `&q=${params.q}` : ''}${limit !== 10 ? `&limit=${limit}` : ''}`}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${program === 'all' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Semua
                        </Link>
                        <Link
                            href={`/santri?program=Diniyah${params.q ? `&q=${params.q}` : ''}${limit !== 10 ? `&limit=${limit}` : ''}`}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${program === 'Diniyah' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Diniyah
                        </Link>
                        <Link
                            href={`/santri?program=Tahfidz${params.q ? `&q=${params.q}` : ''}${limit !== 10 ? `&limit=${limit}` : ''}`}
                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${program === 'Tahfidz' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'}`}
                        >
                            Tahfidz
                        </Link>
                    </div>
                </div>
            </div>

            {/* Content: Mobile (Cards) and Desktop (Table) */}
            <div className="mt-4">
                {/* Mobile List View */}
                <div className="grid grid-cols-1 gap-3 md:hidden">
                    {santri?.length ? (
                        santri.map((s) => (
                            <div key={s.id} className="bg-white p-4 rounded-xl border shadow-sm">
                                <div className="flex items-start justify-between mb-2">
                                    <Link href={`/santri/${s.id}`} className="hover:underline">
                                        <h4 className="font-bold text-slate-900">{s.name}</h4>
                                    </Link>
                                    <div className="flex items-center gap-2">
                                        <Badge className={s.status === 'active' ? 'bg-green-100 text-green-700 border-none' : 'bg-red-100 text-red-700 border-none'}>
                                            {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                        <SantriActions santri={s} />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                    <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">{s.nis}</span>
                                    <span>•</span>
                                    <span>Kelas {s.class}</span>
                                    <span>•</span>
                                    <Badge
                                        variant="secondary"
                                        className={`text-[10px] px-1.5 py-0 border-none ${s.program === 'Diniyah'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-blue-100 text-blue-700'
                                            }`}
                                    >
                                        {s.program}
                                    </Badge>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border">
                            <p className="text-muted-foreground">Santri tidak ditemukan.</p>
                        </div>
                    )}
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-xl border bg-white overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[100px]">NIS</TableHead>
                                <TableHead>Nama</TableHead>
                                <TableHead>JK</TableHead>
                                <TableHead>Asrama</TableHead>
                                <TableHead>Kelas</TableHead>
                                <TableHead>Program</TableHead>
                                <TableHead>Wali</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {santri?.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-mono text-xs">{s.nis}</TableCell>
                                    <TableCell>
                                        <Link href={`/santri/${s.id}`} className="font-semibold text-primary hover:underline">
                                            {s.name}
                                        </Link>
                                    </TableCell>
                                    <TableCell>{s.gender}</TableCell>
                                    <TableCell>{s.dorm || '-'}</TableCell>
                                    <TableCell>{s.class}</TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`text-[10px] px-2 py-0.5 whitespace-nowrap border-none font-semibold ${s.program === 'Diniyah'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-blue-100 text-blue-700'
                                                }`}
                                        >
                                            {s.program || '-'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{s.guardian_name || '-'}</TableCell>
                                    <TableCell>
                                        <Badge className={s.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                                            {s.status === 'active' ? 'Aktif' : 'Nonaktif'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <SantriActions santri={s} />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-col gap-2 md:flex-row md:items-center">
                    <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                        Menampilkan <span className="font-medium text-slate-900">{santri?.length || 0}</span> dari <span className="font-medium text-slate-900">{count || 0}</span> data
                    </p>
                    <div className="flex justify-center md:ml-4">
                        <PaginationLimit currentLimit={limit} />
                    </div>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page <= 1}
                        asChild={page > 1}
                        className="h-9 px-4 rounded-lg"
                    >
                        {page > 1 ? (
                            <Link href={buildUrl(page - 1)}>
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </Link>
                        ) : (
                            <span className="flex items-center">
                                <ChevronLeft className="h-4 w-4 mr-1" />
                                <span className="hidden sm:inline">Sebelumnya</span>
                            </span>
                        )}
                    </Button>

                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                        {page} / {totalPages || 1}
                    </div>

                    <Button
                        variant="outline"
                        size="sm"
                        disabled={page >= totalPages}
                        asChild={page < totalPages}
                        className="h-9 px-4 rounded-lg"
                    >
                        {page < totalPages ? (
                            <Link href={buildUrl(page + 1)}>
                                <span className="hidden sm:inline">Selanjutnya</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </Link>
                        ) : (
                            <span className="flex items-center">
                                <span className="hidden sm:inline">Selanjutnya</span>
                                <ChevronRight className="h-4 w-4 ml-1" />
                            </span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
