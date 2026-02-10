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
import { createSantri, updateSantri } from '@/app/(dashboard)/santri/actions'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'
import { Plus, Pencil } from 'lucide-react'

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
    open: controlledOpen,
    onOpenChange: controlledOnOpenChange
}: {
    santri?: any
    open?: boolean
    onOpenChange?: (open: boolean) => void
}) {
    const [internalOpen, setInternalOpen] = useState(false)

    // Support both controlled and uncontrolled mode
    const isControlled = controlledOpen !== undefined
    const open = isControlled ? controlledOpen : internalOpen
    const setOpen = isControlled ? controlledOnOpenChange! : setInternalOpen

    async function handleSubmit(formData: FormData) {
        const action = santri ? updateSantri : createSantri
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{santri ? 'Edit Santri' : 'Tambah Santri Baru'}</DialogTitle>
                    <DialogDescription>
                        Isi detail santri di bawah ini. Klik simpan jika sudah selesai.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-4 py-4">
                    {santri && <input type="hidden" name="id" value={santri.id} />}

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nis" className="text-right">NIS</Label>
                        <Input id="nis" name="nis" defaultValue={santri?.nis} className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">Nama</Label>
                        <Input id="name" name="name" defaultValue={santri?.name} className="col-span-3" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="gender" className="text-right">Jenis Kelamin</Label>
                        <Select name="gender" defaultValue={santri?.gender || 'L'}>
                            <SelectTrigger className="col-span-3">
                                <SelectValue placeholder="Pilih Jenis Kelamin" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="L">Laki-laki</SelectItem>
                                <SelectItem value="P">Perempuan</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="class" className="text-right">Kelas</Label>
                        <Input id="class" name="class" defaultValue={santri?.class} className="col-span-3" placeholder="Contoh: 1A" required />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dorm" className="text-right">Asrama</Label>
                        <Input id="dorm" name="dorm" defaultValue={santri?.dorm} className="col-span-3" placeholder="Contoh: Abu Bakar" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guardian_name" className="text-right">Nama Wali</Label>
                        <Input id="guardian_name" name="guardian_name" defaultValue={santri?.guardian_name} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="guardian_phone" className="text-right">No. HP Wali</Label>
                        <Input id="guardian_phone" name="guardian_phone" defaultValue={santri?.guardian_phone} className="col-span-3" />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">Status</Label>
                        <Select name="status" defaultValue={santri?.status || 'active'}>
                            <SelectTrigger className="col-span-3">
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
