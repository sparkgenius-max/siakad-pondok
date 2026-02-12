'use client'

import { useState } from 'react'
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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createMonitoring } from '@/components/monitoring/monitoring-actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SantriOption } from '@/types'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan Data'}
        </Button>
    )
}

export function MonitoringDialog({ santriList }: { santriList: SantriOption[] }) {
    const [open, setOpen] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [selectedSantriId, setSelectedSantriId] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        if (!selectedSantriId) {
            toast.error("Pilih Santri")
            return
        }
        formData.append('santri_id', selectedSantriId)

        const res = await createMonitoring(null, formData)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(res?.message || 'Berhasil')
            setOpen(false)
            setSelectedSantriId("")
        }
    }

    const selectedSantriName = santriList.find(s => s.id === selectedSantriId)?.name

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Input Hafalan
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Input Monitoring Tahfidz</DialogTitle>
                    <DialogDescription>
                        Catat perkembangan hafalan santri.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">

                    {/* Santri Selection */}
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label className="text-right">Santri</Label>
                        <div className="w-full">
                            <Select
                                value={selectedSantriId}
                                onValueChange={setSelectedSantriId}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Santri" />
                                </SelectTrigger>
                                <SelectContent>
                                    {santriList?.length > 0 ? (
                                        santriList.map((santri) => (
                                            <SelectItem key={santri.id} value={santri.id}>
                                                {santri.name} ({santri.nis})
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-sm text-muted-foreground">Tidak ada data santri</div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="date" className="text-right">Tanggal</Label>
                        <Input id="date" name="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="ziyadah_pages" className="text-right">Ziyadah (Halaman)</Label>
                        <Input id="ziyadah_pages" name="ziyadah_pages" type="number" defaultValue="0" min="0" required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="murojaah_juz" className="text-right">Murojaah (Juz)</Label>
                        <Input id="murojaah_juz" name="murojaah_juz" type="number" defaultValue="0" min="0" step="0.5" required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Catatan</Label>
                        <Textarea id="notes" name="notes" placeholder="Catatan perkembangan..." />
                    </div>

                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
