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
import { createGrade, updateGrade } from '@/app/(dashboard)/grades/actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Check, ChevronsUpDown, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SantriOption } from '@/types'

// Daftar mata pelajaran pondok pesantren
const SUBJECTS = [
    'Al-Quran', 'Tajwid', 'Tafsir', 'Hadits', 'Fiqih', 'Ushul Fiqih',
    'Aqidah', 'Akhlaq', 'Nahwu', 'Shorof', 'Balaghah', 'Muthalaah',
    'Imla', 'Insya', 'Mahfudzat', 'Tarikh Islam', 'Bahasa Arab',
    'Bahasa Indonesia', 'Bahasa Inggris', 'Matematika', 'IPA', 'IPS'
]

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Menyimpan...' : (isEdit ? 'Perbarui Nilai' : 'Simpan Nilai')}
        </Button>
    )
}

export function GradeDialog({ santriList, grade }: { santriList: SantriOption[], grade?: any }) {
    const [open, setOpen] = useState(false)
    const [openCombobox, setOpenCombobox] = useState(false)
    const [openSubject, setOpenSubject] = useState(false)
    const [selectedSantriId, setSelectedSantriId] = useState<string>(grade?.santri_id || "")
    const [selectedSubject, setSelectedSubject] = useState<string>(grade?.subject || "")

    async function handleSubmit(formData: FormData) {
        if (!selectedSantriId) {
            toast.error("Silakan pilih santri")
            return
        }
        if (!selectedSubject) {
            toast.error("Silakan pilih mata pelajaran")
            return
        }

        formData.append('santri_id', selectedSantriId)
        formData.append('subject', selectedSubject)

        const action = grade ? updateGrade : createGrade
        const res = await action(null, formData)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(res?.message || 'Berhasil')
            setOpen(false)
            if (!grade) {
                setSelectedSantriId("")
                setSelectedSubject("")
            }
        }
    }

    const selectedSantriName = santriList.find(s => s.id === selectedSantriId)?.name

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {grade ? (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Input Nilai
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>{grade ? 'Edit Nilai' : 'Input Nilai Akademik'}</DialogTitle>
                    <DialogDescription>
                        Masukkan nilai mata pelajaran untuk santri.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    {grade && <input type="hidden" name="id" value={grade.id} />}

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
                                        disabled={!!grade}
                                    >
                                        {selectedSantriId
                                            ? selectedSantriName || (grade?.santri?.name)
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
                        <Label htmlFor="academic_year" className="text-right">Tahun Ajaran</Label>
                        <Input
                            id="academic_year"
                            name="academic_year"
                            defaultValue={grade?.academic_year || `${new Date().getFullYear()}/${new Date().getFullYear() + 1}`}
                            className="col-span-3"
                            placeholder="contoh: 2024/2025"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="semester" className="text-right">Semester</Label>
                        <Select name="semester" defaultValue={grade?.semester || "Ganjil"}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Ganjil">Ganjil (Semester 1)</SelectItem>
                                <SelectItem value="Genap">Genap (Semester 2)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Mata Pelajaran</Label>
                        <div className="col-span-3">
                            <Popover open={openSubject} onOpenChange={setOpenSubject}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={openSubject}
                                        className="w-full justify-between"
                                    >
                                        {selectedSubject || "Pilih mata pelajaran..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                    <Command>
                                        <CommandInput placeholder="Cari mapel..." />
                                        <CommandList>
                                            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
                                            <CommandGroup>
                                                {SUBJECTS.map((subj) => (
                                                    <CommandItem
                                                        key={subj}
                                                        value={subj}
                                                        onSelect={() => {
                                                            setSelectedSubject(subj)
                                                            setOpenSubject(false)
                                                        }}
                                                    >
                                                        <Check
                                                            className={cn(
                                                                "mr-2 h-4 w-4",
                                                                selectedSubject === subj ? "opacity-100" : "opacity-0"
                                                            )}
                                                        />
                                                        {subj}
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
                        <Label htmlFor="grade" className="text-right">Nilai</Label>
                        <Input
                            id="grade"
                            name="grade"
                            defaultValue={grade?.grade}
                            className="col-span-3"
                            placeholder="contoh: 85, A, atau B+"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="notes" className="text-right">Catatan</Label>
                        <Input
                            id="notes"
                            name="notes"
                            defaultValue={grade?.notes}
                            className="col-span-3"
                            placeholder="Opsional"
                        />
                    </div>

                    <DialogFooter>
                        <SubmitButton isEdit={!!grade} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
