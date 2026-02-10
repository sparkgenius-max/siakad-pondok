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
import { ArrowLeft, User, DollarSign, CheckCircle, XCircle, Clock } from 'lucide-react'
import { PaymentDialog } from '@/components/payments/payment-dialog'

const MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

export default async function SantriPaymentHistoryPage({
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

    // Fetch all payments for this santri
    const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('santri_id', santriId)
        .order('year', { ascending: false })
        .order('month', { ascending: false })

    // Calculate stats
    const currentYear = new Date().getFullYear()
    const thisYearPayments = payments?.filter(p => p.year === currentYear) || []
    const totalPaidThisYear = thisYearPayments.reduce((sum, p) => sum + (p.amount || 0), 0)
    const paidMonths = thisYearPayments.filter(p => p.status === 'paid').length
    const partialMonths = thisYearPayments.filter(p => p.status === 'partial').length

    // Get santri list for the dialog (just this one for quick add)
    const santriList = [{ id: santri.id, name: santri.name, nis: santri.nis }]

    // Generate payment matrix (last 2 years)
    const years = [currentYear, currentYear - 1]
    const paymentMatrix: Record<number, Record<number, any>> = {}
    years.forEach(year => {
        paymentMatrix[year] = {}
        for (let month = 1; month <= 12; month++) {
            paymentMatrix[year][month] = payments?.find(p => p.year === year && p.month === month) || null
        }
    })

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/payments">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
                        <p className="text-muted-foreground">{santri.name} ({santri.nis})</p>
                    </div>
                </div>
                <PaymentDialog santriList={santriList} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Santri Info</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{santri.class}</div>
                        <p className="text-xs text-muted-foreground">{santri.dorm || 'No dorm assigned'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total {currentYear}</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Rp {totalPaidThisYear.toLocaleString('id-ID')}</div>
                        <p className="text-xs text-muted-foreground">Paid this year</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Paid Months</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{paidMonths}</div>
                        <p className="text-xs text-muted-foreground">of 12 months in {currentYear}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        {paidMonths === 12 ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Clock className="h-4 w-4 text-yellow-500" />}
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">
                            {paidMonths === 12 ? 'Complete' : `${12 - paidMonths - partialMonths} months unpaid`}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {partialMonths > 0 && `${partialMonths} partial payments`}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Payment Matrix by Year */}
            {years.map(year => (
                <Card key={year}>
                    <CardHeader>
                        <CardTitle>Payment Status {year}</CardTitle>
                        <CardDescription>Monthly payment overview</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-6 gap-3 md:grid-cols-12">
                            {MONTHS.map((monthName, index) => {
                                const month = index + 1
                                const payment = paymentMatrix[year]?.[month]
                                const isPaid = payment?.status === 'paid'
                                const isPartial = payment?.status === 'partial'
                                const isPending = payment?.status === 'pending'

                                return (
                                    <div
                                        key={month}
                                        className={`rounded-lg p-3 text-center border-2 transition-colors ${isPaid ? 'bg-green-100 border-green-300' :
                                                isPartial ? 'bg-yellow-100 border-yellow-300' :
                                                    isPending ? 'bg-orange-100 border-orange-300' :
                                                        'bg-gray-50 border-gray-200'
                                            }`}
                                    >
                                        <div className="text-xs font-medium text-muted-foreground mb-1">
                                            {monthName.substring(0, 3)}
                                        </div>
                                        {payment ? (
                                            <>
                                                {isPaid && <CheckCircle className="h-5 w-5 mx-auto text-green-600" />}
                                                {isPartial && <Clock className="h-5 w-5 mx-auto text-yellow-600" />}
                                                {isPending && <Clock className="h-5 w-5 mx-auto text-orange-600" />}
                                                <div className="text-xs mt-1 font-semibold">
                                                    Rp {(payment.amount / 1000).toFixed(0)}k
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="h-5 w-5 mx-auto text-gray-300" />
                                                <div className="text-xs mt-1 text-gray-400">-</div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Detailed Payment History */}
            <Card>
                <CardHeader>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>Complete payment transaction history</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Period</TableHead>
                                <TableHead>Payment Date</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Notes</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments?.length ? (
                                payments.map((p: any) => (
                                    <TableRow key={p.id}>
                                        <TableCell className="font-medium">
                                            {MONTHS[p.month - 1]} {p.year}
                                        </TableCell>
                                        <TableCell>
                                            {new Date(p.payment_date).toLocaleDateString('id-ID', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">
                                            Rp {p.amount?.toLocaleString('id-ID')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={p.status === 'paid' ? 'default' : p.status === 'partial' ? 'secondary' : 'destructive'}>
                                                {p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Pending'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="max-w-[200px] truncate">{p.notes || '-'}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No payment records found for this santri.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
