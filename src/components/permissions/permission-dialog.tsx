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
import { Textarea } from '@/components/ui/textarea'
import { createPermission } from '@/app/(dashboard)/permissions/actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SantriOption } from '@/types'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Submitting...' : 'Submit Request'}
        </Button>
    )
}

export function PermissionDialog({ santriList }: { santriList: SantriOption[] }) {
    const [open, setOpen] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [selectedSantriId, setSelectedSantriId] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        if (!selectedSantriId) {
            toast.error("Please select a Santri")
            return
        }

        formData.append('santri_id', selectedSantriId)

        const res = await createPermission(null, formData)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(res?.message || 'Success')
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
                    Add Permission
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Add Permission Request</DialogTitle>
                    <DialogDescription>
                        Record permission for sick leave, permit, or lateness.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label className="text-right">Santri</Label>
                        <div className="w-full">
                            <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openCombobox}
                                        className="w-full justify-between"
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

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="type" className="text-right">Jenis Izin</Label>
                        <Select name="type" required>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Izin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pulang">Izin Pulang</SelectItem>
                                <SelectItem value="kegiatan_luar">Kegiatan Di Luar</SelectItem>
                                <SelectItem value="organisasi">Kegiatan Organisasi</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue="berlangsung">
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="berlangsung">Berlangsung</SelectItem>
                                <SelectItem value="selesai">Selesai</SelectItem>
                                <SelectItem value="terlambat">Terlambat</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="start_date" className="text-right">Tanggal Mulai</Label>
                        <Input id="start_date" name="start_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="end_date" className="text-right">Tanggal Selesai</Label>
                        <Input id="end_date" name="end_date" type="date" defaultValue={new Date().toISOString().split('T')[0]} required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="reason" className="text-right">Keterangan</Label>
                        <Textarea id="reason" name="reason" placeholder="Keterangan izin..." required />
                    </div>

                    <DialogFooter>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
