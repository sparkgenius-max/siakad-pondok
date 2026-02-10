'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createPayment } from '@/app/(dashboard)/payments/actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SantriOption } from '@/types'

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

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan Pembayaran'}
        </Button>
    )
}

interface PaymentDialogProps {
    santriList: SantriOption[]
    defaultSantriId?: string
    defaultMonth?: number
    defaultYear?: number
}

export function PaymentDialog({ santriList, defaultSantriId, defaultMonth, defaultYear }: PaymentDialogProps) {
    const [open, setOpen] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [selectedSantriId, setSelectedSantriId] = useState<string>(defaultSantriId || "")

    // Reset selected santri when defaultSantriId changes
    useEffect(() => {
        if (defaultSantriId) {
            setSelectedSantriId(defaultSantriId)
        }
    }, [defaultSantriId])

    async function handleSubmit(formData: FormData) {
        if (!selectedSantriId) {
            toast.error("Silakan pilih santri")
            return
        }

        formData.append('santri_id', selectedSantriId)

        const res = await createPayment(null, formData)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(res?.message || 'Berhasil')
            setOpen(false)
            if (!defaultSantriId) setSelectedSantriId("")
        }
    }

    const selectedSantriName = santriList.find(s => s.id === selectedSantriId)?.name
    const currentMonth = new Date().getMonth() + 1
    const currentYear = new Date().getFullYear()

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {defaultSantriId ? (
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-1" />
                        Bayar
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Input Pembayaran
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Input Pembayaran Syahriah</DialogTitle>
                    <DialogDescription>
                        Masukkan data pembayaran bulanan santri.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Santri</Label>
                        <div className="col-span-3">
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between"
                                        disabled={!!defaultSantriId}
                                    >
                                        {selectedSantriId
                                            ? selectedSantriName
                                            : "Pilih santri..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari santri..." />
                                        <CommandList>
                                            <CommandEmpty>Santri tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {santriList?.map((santri) => (
                                                    <CommandItem
                                                        key={santri.id}
                                                        value={santri.name}
                                                        onSelect={() => {
                                                            setSelectedSantriId(santri.id)
                                                            setOpenCombobox(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedSantriId === santri.id ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {santri.name} ({santri.nis})
                                                    </CommandItem>
                                                ))}
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="month" className="text-right">Bulan</Label>
                        <Select name="month" defaultValue={String(defaultMonth || currentMonth)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Bulan" />
                            </SelectTrigger>
                            <SelectContent>
                                {MONTHS.map((m) => (
                                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="year" className="text-right">Tahun</Label>
                        <Select name="year" defaultValue={String(defaultYear || currentYear)}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {[currentYear, currentYear - 1].map(y => (
                                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="amount" className="text-right">Jumlah (Rp)</Label>
                        <Input id="amount" name="amount" type="number" min="0" defaultValue="500000" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="payment_date" className="text-right">Tanggal</Label>
                        <Input id="payment_date" name="payment_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue="paid">
                            <SelectTrigger className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="paid">Lunas</SelectItem>
                                <SelectItem value="partial">Sebagian (Cicilan)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Catatan</Label>
                        <Input id="notes" name="notes" className="col-span-3" placeholder="Opsional" />
                    </div>

                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
