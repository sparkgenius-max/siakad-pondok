import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PaymentDialog } from '@/components/payments/payment-dialog'
import { PaymentsFilter } from '@/components/payments/payments-filter'
import { PaymentsActions } from '@/components/payments/payments-actions'
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
import Link from 'next/link'
import { DollarSign, Users, CheckCircle, AlertCircle, Calendar, History } from 'lucide-react'

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
    searchParams: Promise<{ month?: string; year?: string; tab?: string }>
}) {
    const params = await searchParams
    const supabase = createAdminClient()

    // Default values
    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const selectedMonth = params.month ? Number(params.month) : currentMonth
    const selectedYear = params.year ? Number(params.year) : currentYear

    // We only have one main view now, "recap" is default.
    // If 'tab' param exists, we can still use it, but we mainly show Recap.
    const activeTab = 'recap'

    const [santriListResult, monthlyPaymentsResult, allSantriResult] = await Promise.all([
        // Fetch santri list for dialog
        supabase.from('santri').select('id, name, nis, class').eq('status', 'active').order('name'),
        // Monthly recap data
        supabase.from('payments').select('*, santri(id, name, nis)')
            .eq('month', selectedMonth).eq('year', selectedYear).order('payment_date', { ascending: false }),
        // All active santri for recap
        supabase.from('santri').select('id, name, nis', { count: 'exact' }).eq('status', 'active').order('name')
    ])

    const santriList = santriListResult.data || []
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

    // Prepare data for PDF export (Merge allSantri with payment status)
    const exportData = allSantri.map((santri: any) => {
        const payment = monthlyPayments.find(p => p.santri_id === santri.id)
        return {
            nis: santri.nis,
            name: santri.name,
            status: payment?.status === 'paid' ? 'Lunas' : payment?.status === 'partial' ? 'Sebagian' : 'Belum Bayar',
            amount: payment?.amount || 0,
            date: payment ? new Date(payment.payment_date).toLocaleDateString('id-ID') : '-'
        }
    })

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Pembayaran Syahriah</h2>
                <div className="flex items-center gap-2">
                    <PaymentDialog santriList={santriList} />
                </div>
            </div>

            <Tabs defaultValue={activeTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="recap">Rekap Bulanan</TabsTrigger>
                </TabsList>

                {/* MONTHLY RECAP TAB */}
                <TabsContent value="recap" className="space-y-4">
                    {/* Month/Year Filter */}
                    <Card>
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Pilih Periode
                            </CardTitle>
                            <PaymentsActions
                                data={exportData}
                                month={selectedMonth}
                                year={selectedYear}
                                totalCollected={totalCollected}
                            />
                        </CardHeader>
                        <CardContent>
                            <PaymentsFilter
                                selectedMonth={selectedMonth}
                                selectedYear={selectedYear}
                                currentYear={currentYear}
                            />
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
                                                        <Link href={`/santri/${santri.id}?tab=payments`}>Riwayat</Link>
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
                                                        <Button variant="ghost" size="icon" asChild title="Riwayat">
                                                            <Link href={`/santri/${santri.id}?tab=payments`}>
                                                                <History className="h-4 w-4" />
                                                            </Link>
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
