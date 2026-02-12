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

// Daftar mata pelajaran Diniyah
import { ACADEMIC_YEARS, SEMESTERS, DINIYAH_SUBJECTS } from '@/lib/constants'

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
    const [selectedClass, setSelectedClass] = useState<string>("all")

    // Sort classes: Ula -> Wustha -> Ulya
    const diniyahOrder = ['Ula', 'Wustha', 'Ulya']
    const uniqueClasses = [...new Set(santriList.map(s => s.class).filter(Boolean))].sort((a, b) => {
        const indexA = diniyahOrder.indexOf(a)
        const indexB = diniyahOrder.indexOf(b)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return a.localeCompare(b)
    })

    const filteredSantriList = selectedClass === 'all'
        ? santriList
        : santriList.filter(s => s.class === selectedClass)

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

                    {/* Program Field (Read Only) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Program</Label>
                        <Input value="Diniyah" disabled className="col-span-3 bg-slate-50" />
                    </div>

                    {/* Class Filter */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="text-right">Filter Kelas</Label>
                        <Select
                            onValueChange={(val) => {
                                // Reset selected santri if class changes
                                if (val !== selectedClass) {
                                    setSelectedSantriId("")
                                }
                                setSelectedClass(val)
                            }}
                            value={selectedClass}
                        >
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Semua Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Kelas</SelectItem>
                                {uniqueClasses.map(c => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

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
                                                {filteredSantriList.map((santri) => (
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
                        <Select name="academic_year" defaultValue={grade?.academic_year || ACADEMIC_YEARS[0]}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {ACADEMIC_YEARS.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="semester" className="text-right">Semester</Label>
                        <Select name="semester" defaultValue={grade?.semester || SEMESTERS[0].value}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEMESTERS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
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
                                                {DINIYAH_SUBJECTS.map((subj) => (
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
                        <Label htmlFor="score_theory" className="text-right">Nilai Teori</Label>
                        <Input
                            id="score_theory"
                            name="score_theory"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={grade?.score_theory}
                            className="col-span-3"
                            placeholder="0-100"
                        />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="score_practice" className="text-right">Nilai Praktek</Label>
                        <Input
                            id="score_practice"
                            name="score_practice"
                            type="number"
                            min="0"
                            max="100"
                            defaultValue={grade?.score_practice}
                            className="col-span-3"
                            placeholder="0-100"
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
