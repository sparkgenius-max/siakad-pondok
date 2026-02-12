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
import { Checkbox } from '@/components/ui/checkbox'
import { createSantri, updateSantri } from '@/app/(dashboard)/santri/actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'
import type { Program } from '@/types'

function SubmitButton({ isEdit }: { isEdit: boolean }) {
    const { pending } = useFormStatus()
    return (
        <Button type="submit" disabled={pending}>
            {pending ? (isEdit ? 'Memperbarui...' : 'Menyimpan...') : (isEdit ? 'Simpan Perubahan' : 'Simpan Santri')}
        </Button>
    )
}

export function SantriDialog({
    santri,
    programs = [],
    enrolledProgramIds = [],
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: {
    santri?: any
    programs?: Program[]
    enrolledProgramIds?: string[]
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = useState(false)

    // Support both controlled and uncontrolled mode
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    const [selectedProgram, setSelectedProgram] = useState<string>(santri?.program || 'Diniyah')

    async function handleSubmit(formData: FormData) {
        const action = santri ? updateSantri : createSantri

        // Ensure class is set for Tahfidz if hidden
        if (selectedProgram === 'Tahfidz') {
            formData.set('class', '-')
        }

        const res = await action(null, formData)

        if (res?.error) {
            toast.error(res.error)
        } else {
            toast.success(res?.message || 'Berhasil')
            setOpen(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {santri ? (
                    <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                    </Button>
                ) : (
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Tambah Santri
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{santri ? 'Edit Santri' : 'Tambah Santri Baru'}</DialogTitle>
                    <DialogDescription>
                        Isi detail santri di bawah ini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    {santri && <input type="hidden" name="id" value={santri.id} />}

                    {/* Program Selection - Moved to Top */}
                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="program" className="text-right">Program</Label>
                        <Select
                            name="program"
                            defaultValue={selectedProgram}
                            onValueChange={setSelectedProgram}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Program" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Diniyah">Diniyah</SelectItem>
                                <SelectItem value="Tahfidz">Tahfidz</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Class Selection - Conditional based on Program */}
                    {selectedProgram === 'Diniyah' ? (
                        <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                            <Label htmlFor="class" className="text-right">Kelas</Label>
                            <Select name="class" defaultValue={santri?.class || 'Ula'}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ula">Ula</SelectItem>
                                    <SelectItem value="Wustha">Wustha</SelectItem>
                                    <SelectItem value="Ulya">Ulya</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    ) : (
                        <input type="hidden" name="class" value="-" />
                    )}

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="nis" className="text-right">NIS</Label>
                        <Input id="nis" name="nis" defaultValue={santri?.nis} required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nama</Label>
                        <Input id="name" name="name" defaultValue={santri?.name} required />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="gender" className="text-right">Jenis Kelamin</Label>
                        <Select name="gender" defaultValue={santri?.gender || 'L'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="L">Laki-laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="origin_address" className="text-right">Alamat Asal</Label>
                        <Input id="origin_address" name="origin_address" defaultValue={santri?.origin_address} placeholder="Kota/Kabupaten Asal" />
                    </div>

                    {/* Class Field Removed from here (Moved up) */}

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="dorm" className="text-right">Asrama</Label>
                        <Input id="dorm" name="dorm" defaultValue={santri?.dorm} placeholder="Contoh: Abu Bakar" />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="guardian_name" className="text-right">Nama Wali</Label>
                        <Input id="guardian_name" name="guardian_name" defaultValue={santri?.guardian_name} />
                    </div>

                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="guardian_phone" className="text-right">No. HP Wali</Label>
                        <Input id="guardian_phone" name="guardian_phone" defaultValue={santri?.guardian_phone} />
                    </div>



                    <div className="grid grid-cols-[120px_1fr] items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue={santri?.status || 'active'}>
                            <SelectTrigger>
                                <SelectValue placeholder="Pilih Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Aktif</SelectItem>
                                <SelectItem value="inactive">Tidak Aktif</SelectItem>
                                <SelectItem value="graduated">Alumni</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <SubmitButton isEdit={!!santri} />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
