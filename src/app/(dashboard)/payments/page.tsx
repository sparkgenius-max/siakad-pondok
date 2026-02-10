import { createClient } from '@/lib/supabase/server'
import { PaymentDialog } from '@/components/payments/payment-dialog'
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search, DollarSign, Users, CheckCircle, AlertCircle, Calendar } from 'lucide-react'
import { PaginationLimit } from '@/components/layout/pagination-limit'

const MONTHS = [
    { value: '1', label: 'Januari' },
    { value: '2', label: 'Februari' },
    { value: '3', label: 'Maret' },
    { value: '4', label: 'April' },
    { value: '5', label: 'Mei' },
    { value: '6', label: 'Juni' },
    { value: '7', label: 'Juli' },
    { value: '8', label: 'Agustus' },
    { value: '9', label: 'September' },
    { value: '10', label: 'Oktober' },
    { value: '11', label: 'November' },
    { value: '12', label: 'Desember' },
]

export default async function PaymentsPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; month?: string; year?: string; tab?: string; limit?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 15
    const from = (page - 1) * limit
    const to = from + limit - 1

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const selectedMonth = params.month ? Number(params.month) : currentMonth
    const selectedYear = params.year ? Number(params.year) : currentYear
    const activeTab = params.tab || 'all'

    // Parallel fetch untuk performa lebih baik
    const [santriListResult, paymentsResult, monthlyPaymentsResult, allSantriResult] = await Promise.all([
        // Fetch santri list for dialog
        supabase.from('santri').select('id, name, nis').eq('status', 'active').order('name'),
        // Fetch payments list
        supabase.from('payments').select('*, santri(id, name, nis)', { count: 'exact' })
            .order('payment_date', { ascending: false }).range(from, to),
        // Monthly recap data
        supabase.from('payments').select('*, santri(id, name, nis)')
            .eq('month', selectedMonth).eq('year', selectedYear).order('payment_date', { ascending: false }),
        // All active santri for recap
        supabase.from('santri').select('id, name, nis', { count: 'exact' }).eq('status', 'active').order('name')
    ])

    const santriList = santriListResult.data || []
    const payments = paymentsResult.data || []
    const count = paymentsResult.count || 0
    const totalPages = Math.ceil(count / limit)
    const monthlyPayments = monthlyPaymentsResult.data || []
    const allSantri = allSantriResult.data || []
    const totalSantri = allSantriResult.count || 0

    // Calculate stats
    const paidSantriIds = new Set(monthlyPayments.filter(p => p.status === 'paid').map(p => p.santri_id))
    const partialSantriIds = new Set(monthlyPayments.filter(p => p.status === 'partial').map(p => p.santri_id))
    const totalCollected = monthlyPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const paidCount = paidSantriIds.size
    const partialCount = partialSantriIds.size
    const unpaidCount = totalSantri - paidCount - partialCount

    // Build URL helper
    const buildUrl = (newParams: Record<string, string | number>) => {
        const urlParams = new URLSearchParams()
        const merged = { page: params.page, q: params.q, month: params.month, year: params.year, tab: params.tab, ...newParams }
        Object.entries(merged).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') urlParams.set(k, String(v))
        })
        return `/payments?${urlParams.toString()}`
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pembayaran Syahriah</h2>
                <PaymentDialog santriList={santriList} />
            </div>

            {/* Note: Tabs use URL for state to allow bookmarking, but content is pre-loaded */}
            <Tabs value={activeTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all" asChild>
                        <Link href="/payments?tab=all" prefetch={true}>Semua Pembayaran</Link>
                    </TabsTrigger>
                    <TabsTrigger value="recap" asChild>
                        <Link href={`/payments?tab=recap&month=${selectedMonth}&year=${selectedYear}`} prefetch={true}>Rekap Bulanan</Link>
                    </TabsTrigger>
                </TabsList>

                {/* ALL PAYMENTS TAB */}
                <TabsContent value="all" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <form className="flex items-center gap-2">
                            <input type="hidden" name="tab" value="all" />
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="q"
                                    type="search"
                                    placeholder="Cari catatan..."
                                    className="pl-8 w-[250px]"
                                    defaultValue={params.q}
                                />
                            </div>
                            <Button type="submit" variant="secondary">Cari</Button>
                        </form>
                    </div>

                    <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                        <CardContent className="p-0">
                            {/* Mobile Card List */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {payments.length ? (
                                    payments.map((p: any) => (
                                        <div key={p.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <Link href={`/payments/santri/${p.santri?.id}`} className="hover:underline">
                                                        <h4 className="font-bold text-slate-900">{p.santri?.name}</h4>
                                                        <p className="text-[10px] text-muted-foreground font-mono bg-slate-100 w-fit px-1 rounded">{p.santri?.nis}</p>
                                                    </Link>
                                                </div>
                                                <Badge variant={p.status === 'paid' ? 'default' : p.status === 'partial' ? 'secondary' : 'destructive'}
                                                    className={p.status === 'paid' ? 'bg-green-100 text-green-700 border-none' : p.status === 'partial' ? 'bg-yellow-100 text-yellow-700 border-none' : ''}>
                                                    {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Belum'}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                                <div className="text-xs space-y-1">
                                                    <p className="text-muted-foreground">Periode: <span className="text-slate-700 font-medium">{MONTHS[p.month - 1]?.label} {p.year}</span></p>
                                                    <p className="text-muted-foreground">Tanggal: <span className="text-slate-700 font-medium">{new Date(p.payment_date).toLocaleDateString('id-ID')}</span></p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-slate-900">Rp {p.amount?.toLocaleString('id-ID')}</p>
                                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] px-2" asChild>
                                                        <Link href={`/payments/santri/${p.santri?.id}`}>Riwayat</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border">
                                        <p className="text-muted-foreground">Belum ada data pembayaran.</p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="whitespace-nowrap">Tanggal</TableHead>
                                            <TableHead>Santri</TableHead>
                                            <TableHead>Periode</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="hidden lg:table-cell">Catatan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {payments.length ? (
                                            payments.map((p: any) => (
                                                <TableRow key={p.id}>
                                                    <TableCell className="font-medium whitespace-nowrap text-xs">
                                                        {new Date(p.payment_date).toLocaleDateString('id-ID')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Link href={`/payments/santri/${p.santri?.id}`} className="hover:underline">
                                                            <div className="font-semibold text-slate-900">{p.santri?.name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">{p.santri?.nis}</div>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="whitespace-nowrap text-sm">{MONTHS[p.month - 1]?.label} {p.year}</TableCell>
                                                    <TableCell className="text-right font-bold text-slate-900">Rp {p.amount?.toLocaleString('id-ID')}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={p.status === 'paid' ? 'default' : p.status === 'partial' ? 'secondary' : 'destructive'}
                                                            className={p.status === 'paid' ? 'bg-green-100 text-green-700' : p.status === 'partial' ? 'bg-yellow-100 text-yellow-700' : ''}>
                                                            {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Belum'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="hidden lg:table-cell max-w-[150px] truncate text-xs text-muted-foreground">{p.notes || '-'}</TableCell>
                                                    <TableCell className="text-right">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/payments/santri/${p.santri?.id}`}>Riwayat</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                                    Belum ada data pembayaran.
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
                                Menampilkan <span className="font-medium text-slate-900">{payments.length}</span> dari <span className="font-medium text-slate-900">{count}</span> data
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

                {/* MONTHLY RECAP TAB */}
                <TabsContent value="recap" className="space-y-4">
                    {/* Month/Year Filter */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Pilih Periode
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="flex items-center gap-4">
                                <input type="hidden" name="tab" value="recap" />
                                <Select name="month" defaultValue={String(selectedMonth)}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Bulan" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MONTHS.map(m => (
                                            <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select name="year" defaultValue={String(selectedYear)}>
                                    <SelectTrigger className="w-[120px]">
                                        <SelectValue placeholder="Tahun" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[currentYear, currentYear - 1].map(y => (
                                            <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit">Tampilkan</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Stats Cards */}
                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="border-l-4 border-l-blue-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Total Terkumpul</CardTitle>
                                <DollarSign className="h-4 w-4 text-blue-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">Rp {totalCollected.toLocaleString('id-ID')}</div>
                                <p className="text-xs text-muted-foreground">{MONTHS[selectedMonth - 1]?.label} {selectedYear}</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-green-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sudah Lunas</CardTitle>
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                                <p className="text-xs text-muted-foreground">dari {totalSantri} santri</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-yellow-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Sebagian</CardTitle>
                                <Users className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-yellow-600">{partialCount}</div>
                                <p className="text-xs text-muted-foreground">pembayaran cicilan</p>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
                                <AlertCircle className="h-4 w-4 text-red-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
                                <p className="text-xs text-muted-foreground">perlu follow-up</p>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                        <CardHeader className="bg-white md:bg-transparent rounded-t-xl border md:border-none mb-3 md:mb-0">
                            <CardTitle>Status Pembayaran {MONTHS[selectedMonth - 1]?.label} {selectedYear}</CardTitle>
                            <CardDescription>Daftar status pembayaran per santri</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            {/* Mobile Card List */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {allSantri.map((santri: any) => {
                                    const payment = monthlyPayments.find(p => p.santri_id === santri.id)
                                    const status = payment?.status || 'unpaid'
                                    const amount = payment?.amount || 0

                                    return (
                                        <div key={santri.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-slate-900">{santri.name}</h4>
                                                    <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1 rounded">{santri.nis}</span>
                                                </div>
                                                <Badge className={
                                                    status === 'paid' ? 'bg-green-100 text-green-700 border-none' :
                                                        status === 'partial' ? 'bg-yellow-100 text-yellow-700 border-none' :
                                                            'bg-red-100 text-red-700 border-none'
                                                }>
                                                    {status === 'paid' ? 'Lunas' : status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                <div className="text-sm font-bold text-slate-900">
                                                    {amount > 0 ? `Rp ${amount.toLocaleString('id-ID')}` : 'Rp 0'}
                                                </div>
                                                <div className="flex gap-2">
                                                    {status !== 'paid' && (
                                                        <PaymentDialog santriList={[santri]} defaultSantriId={santri.id} defaultMonth={selectedMonth} defaultYear={selectedYear} />
                                                    )}
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                                        <Link href={`/payments/santri/${santri.id}`}>Riwayat</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Desktop Table View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead className="w-[50px]">No</TableHead>
                                            <TableHead>NIS</TableHead>
                                            <TableHead>Nama Santri</TableHead>
                                            <TableHead className="text-center">Status</TableHead>
                                            <TableHead className="text-right">Jumlah</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {allSantri.map((santri: any, index: number) => {
                                            const payment = monthlyPayments.find(p => p.santri_id === santri.id)
                                            const status = payment?.status || 'unpaid'
                                            const amount = payment?.amount || 0

                                            return (
                                                <TableRow key={santri.id}>
                                                    <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                                                    <TableCell className="font-mono text-sm">{santri.nis}</TableCell>
                                                    <TableCell className="font-semibold text-slate-900">{santri.name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={
                                                            status === 'paid' ? 'bg-green-100 text-green-700' :
                                                                status === 'partial' ? 'bg-yellow-100 text-yellow-700' :
                                                                    'bg-red-100 text-red-700'
                                                        }>
                                                            {status === 'paid' ? 'Lunas' : status === 'partial' ? 'Sebagian' : 'Belum Bayar'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-right font-bold text-slate-900">
                                                        {amount > 0 ? `Rp ${amount.toLocaleString('id-ID')}` : '-'}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        {status !== 'paid' && (
                                                            <PaymentDialog santriList={[santri]} defaultSantriId={santri.id} defaultMonth={selectedMonth} defaultYear={selectedYear} />
                                                        )}
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <Link href={`/payments/santri/${santri.id}`}>Riwayat</Link>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
