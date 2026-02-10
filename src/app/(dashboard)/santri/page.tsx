import { createClient } from '@/lib/supabase/server'
import { SantriDialog } from '@/components/santri/santri-dialog'
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
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'

export default async function SantriPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = 10
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
        .from('santri')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (params.q) {
        query = query.ilike('name', `%${params.q}%`)
    }

    const { data: santri, count } = await query

    const totalPages = count ? Math.ceil(count / limit) : 0

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Manajemen Santri</h2>
                <SantriDialog />
            </div>

            <div className="flex items-center py-4">
                <form className="flex w-full max-w-sm items-center space-x-2">
                    <div className="relative w-full">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            name="q"
                            type="search"
                            placeholder="Cari santri..."
                            className="pl-8"
                            defaultValue={params.q}
                        />
                    </div>
                    <Button type="submit" variant="secondary">Cari</Button>
                </form>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>NIS</TableHead>
                            <TableHead>Nama</TableHead>
                            <TableHead>Kelas</TableHead>
                            <TableHead>Asrama</TableHead>
                            <TableHead>Jenis Kelamin</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {santri?.length ? (
                            santri.map((s) => (
                                <TableRow key={s.id}>
                                    <TableCell>{s.nis}</TableCell>
                                    <TableCell className="font-medium">{s.name}</TableCell>
                                    <TableCell>{s.class}</TableCell>
                                    <TableCell>{s.dorm || '-'}</TableCell>
                                    <TableCell>
                                        {s.gender === 'L' ? 'Laki-laki' : s.gender === 'P' ? 'Perempuan' : s.gender}
                                    </TableCell>
                                    <TableCell>
                                        <span className="capitalize">
                                            {s.status === 'active' ? 'Aktif' : s.status === 'inactive' ? 'Tidak Aktif' : s.status}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <SantriActions santri={s} />
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    Santri tidak ditemukan.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between py-4">
                <div className="text-sm text-muted-foreground">
                    Menampilkan {santri?.length || 0} dari {count || 0} data
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
                        {page > 1 ? (
                            <Link href={`/santri?page=${page - 1}&q=${params.q || ''}`} className="flex items-center">
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
                            <Link href={`/santri?page=${page + 1}&q=${params.q || ''}`} className="flex items-center">
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
        </div>
    )
}
