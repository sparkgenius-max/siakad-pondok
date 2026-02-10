'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Wallet, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { generateBulkPayments } from '@/app/(dashboard)/payments/actions'

interface Santri {
    id: string
    name: string
    nis: string
    class: string
}

interface ExistingPayment {
    santri_id: string
    status: string
    amount: number
}

interface BulkPaymentFormProps {
    santriList: Santri[]
    existingPayments: ExistingPayment[]
    month: number
    year: number
    monthLabel: string
}

export function BulkPaymentForm({
    santriList,
    existingPayments,
    month,
    year,
    monthLabel
}: BulkPaymentFormProps) {
    const [selectedIds, setSelectedIds] = useState<Set<string>>(() => {
        // Pre-select santri who haven't paid
        const paidIds = new Set(existingPayments.map(p => p.santri_id))
        return new Set(santriList.filter(s => !paidIds.has(s.id)).map(s => s.id))
    })
    const [amount, setAmount] = useState('500000')
    const [saving, setSaving] = useState(false)

    const paidMap = new Map(existingPayments.map(p => [p.santri_id, p]))

    const toggleSelect = (id: string) => {
        const newSet = new Set(selectedIds)
        if (newSet.has(id)) {
            newSet.delete(id)
        } else {
            newSet.add(id)
        }
        setSelectedIds(newSet)
    }

    const toggleAll = () => {
        const unpaidIds = santriList.filter(s => !paidMap.has(s.id)).map(s => s.id)
        if (selectedIds.size === unpaidIds.length) {
            setSelectedIds(new Set())
        } else {
            setSelectedIds(new Set(unpaidIds))
        }
    }

    const handleSubmit = async () => {
        if (selectedIds.size === 0) {
            toast.error('Pilih minimal 1 santri')
            return
        }

        const amountNum = parseInt(amount)
        if (isNaN(amountNum) || amountNum <= 0) {
            toast.error('Jumlah tagihan tidak valid')
            return
        }

        setSaving(true)

        const result = await generateBulkPayments({
            santri_ids: Array.from(selectedIds),
            month,
            year,
            amount: amountNum
        })

        setSaving(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(result.message)
            setSelectedIds(new Set()) // Clear selection after success
        }
    }

    const unpaidCount = santriList.filter(s => !paidMap.has(s.id)).length

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <Wallet className="h-5 w-5" />
                        Generate Tagihan {monthLabel} {year}
                    </CardTitle>
                    <CardDescription>
                        {selectedIds.size} santri dipilih • {unpaidCount} belum bayar
                    </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Jumlah:</span>
                        <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="w-[140px]"
                            min="0"
                        />
                    </div>
                    <Button onClick={handleSubmit} disabled={saving || selectedIds.size === 0}>
                        {saving ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Memproses...</>
                        ) : (
                            <><Wallet className="mr-2 h-4 w-4" />Generate Tagihan ({selectedIds.size})</>
                        )}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">
                                <Checkbox
                                    checked={selectedIds.size === unpaidCount && unpaidCount > 0}
                                    onCheckedChange={toggleAll}
                                />
                            </TableHead>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead className="w-[100px]">NIS</TableHead>
                            <TableHead>Nama Santri</TableHead>
                            <TableHead className="w-[80px]">Kelas</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {santriList.map((santri, index) => {
                            const payment = paidMap.get(santri.id)
                            const isPaid = !!payment
                            const isSelected = selectedIds.has(santri.id)

                            return (
                                <TableRow key={santri.id} className={isPaid ? 'opacity-60' : ''}>
                                    <TableCell>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => toggleSelect(santri.id)}
                                            disabled={isPaid}
                                        />
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-sm">{santri.nis}</TableCell>
                                    <TableCell className="font-medium">{santri.name}</TableCell>
                                    <TableCell>{santri.class}</TableCell>
                                    <TableCell className="text-center">
                                        {isPaid ? (
                                            <Badge className="bg-green-100 text-green-700">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                {payment.status === 'paid' ? 'Lunas' : 'Sebagian'}
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-red-600 border-red-300">
                                                <AlertCircle className="h-3 w-3 mr-1" />
                                                Belum Bayar
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right font-medium">
                                        {isPaid ? (
                                            `Rp ${payment.amount.toLocaleString('id-ID')}`
                                        ) : isSelected ? (
                                            <span className="text-blue-600">Rp {parseInt(amount).toLocaleString('id-ID')}</span>
                                        ) : (
                                            '-'
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
