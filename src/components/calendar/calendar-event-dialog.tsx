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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createEvent } from '@/app/(dashboard)/calendar/actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Check, Calendar } from 'lucide-react'

interface CalendarEventDialogProps {
    defaultDate?: Date | null
    trigger?: React.ReactNode
}

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : 'Simpan Agenda'}
        </Button>
    )
}

export function CalendarEventDialog({ defaultDate, trigger }: CalendarEventDialogProps) {
    const [open, setOpen] = useState(false)
    const [category, setCategory] = useState('other')

    // Format date for inputs
    const dateStr = defaultDate ? defaultDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    const defaultTime = defaultDate ? defaultDate.toTimeString().slice(0, 5) : '08:00'

    async function handleSubmit(formData: FormData) {
        // Append category manually just in case
        formData.append('category', category)

        const res = await createEvent(null, formData)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(res?.message || 'Agenda berhasil ditambahkan')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Agenda
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Tambah Agenda Baru</DialogTitle>
                    <DialogDescription>
                        Masukkan detail agenda, ujian, atau hari libur.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">Judul</Label>
                        <Input id="title" name="title" className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">Deskripsi</Label>
                        <Input id="description" name="description" className="col-span-3" placeholder="Detail acara (opsional)" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="category" className="text-right">Kategori</Label>
                        <Select name="category" value={category} onValueChange={setCategory}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Kategori" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="holiday">Libur</SelectItem>
                                <SelectItem value="exam">Ujian</SelectItem>
                                <SelectItem value="activity">Kegiatan</SelectItem>
                                <SelectItem value="meeting">Rapat</SelectItem>
                                <SelectItem value="other">Lainnya</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Mulai</Label>
                        <div className="col-span-3 flex gap-2">
                            <Input type="date" name="start_date" defaultValue={dateStr} required className="flex-1" />
                            <Input type="time" name="start_time" defaultValue={defaultTime} className="w-[100px]" />
                        </div>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Selesai</Label>
                        <div className="col-span-3 flex gap-2">
                            <Input type="date" name="end_date" defaultValue={dateStr} required className="flex-1" />
                            <Input type="time" name="end_time" defaultValue="17:00" className="w-[100px]" />
                        </div>
                    </div>

                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
