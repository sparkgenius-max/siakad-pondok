import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Wallet, Users, FileText } from 'lucide-react'
import Link from 'next/link'
import { BulkPaymentForm } from '@/components/payments/bulk-payment-form'

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

export default async function BulkPaymentPage({
    searchParams,
}: {
    searchParams: Promise<{ month?: string; year?: string; class?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    const currentYear = new Date().getFullYear()
    const currentMonth = new Date().getMonth() + 1
    const selectedMonth = params.month ? Number(params.month) : currentMonth
    const selectedYear = params.year ? Number(params.year) : currentYear
    const selectedClass = params.class || 'all'

    // Get unique classes
    const { data: classesData } = await supabase
        .from('santri')
        .select('class')
        .eq('status', 'active')
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort()

    // Get santri based on class filter
    let santriQuery = supabase
        .from('santri')
        .select('id, name, nis, class')
        .eq('status', 'active')
        .order('name')

    if (selectedClass !== 'all') {
        santriQuery = santriQuery.eq('class', selectedClass)
    }

    const { data: santriList } = await santriQuery

    // Get existing payments for selected month/year
    const santriIds = santriList?.map(s => s.id) || []
    let existingPayments: any[] = []

    if (santriIds.length > 0) {
        const { data } = await supabase
            .from('payments')
            .select('santri_id, status, amount')
            .in('santri_id', santriIds)
            .eq('month', selectedMonth)
            .eq('year', selectedYear)
        existingPayments = data || []
    }

    // Calculate stats
    const totalSantri = santriList?.length || 0
    const paidCount = existingPayments.filter(p => p.status === 'paid').length
    const unpaidCount = totalSantri - existingPayments.length

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/payments">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Generate Tagihan</h2>
                    <p className="text-muted-foreground">Generate tagihan syahriah untuk banyak santri sekaligus</p>
                </div>
            </div>

            {/* Filter Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Pilih Periode dan Kelas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex items-center gap-4 flex-wrap">
                        <Select name="month" defaultValue={String(selectedMonth)}>
                            <SelectTrigger className="w-[160px]">
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

                        <Select name="class" defaultValue={selectedClass}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Semua Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kelas</SelectItem>
                                {uniqueClasses.map(cls => (
                                    <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button type="submit">Tampilkan</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Total Santri</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSantri}</div>
                        <p className="text-xs text-muted-foreground">
                            {selectedClass === 'all' ? 'Semua kelas' : `Kelas ${selectedClass}`}
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Sudah Bayar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{paidCount}</div>
                        <p className="text-xs text-muted-foreground">{MONTHS[selectedMonth - 1]?.label} {selectedYear}</p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-red-500">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium">Belum Bayar</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{unpaidCount}</div>
                        <p className="text-xs text-muted-foreground">Perlu generate tagihan</p>
                    </CardContent>
                </Card>
            </div>

            {/* Bulk Payment Form */}
            {santriList && santriList.length > 0 ? (
                <BulkPaymentForm
                    santriList={santriList}
                    existingPayments={existingPayments}
                    month={selectedMonth}
                    year={selectedYear}
                    monthLabel={MONTHS[selectedMonth - 1]?.label || ''}
                />
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Tidak Ada Santri</h3>
                        <p className="text-muted-foreground">Tidak ada santri aktif untuk ditampilkan</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
