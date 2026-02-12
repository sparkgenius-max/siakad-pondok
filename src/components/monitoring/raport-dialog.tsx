'use client'

import { useState, useTransition } from 'react'
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
import { saveRaport } from './monitoring-actions'
import { toast } from 'sonner'
import { FileText, Loader2 } from 'lucide-react'
import { SantriOption } from '@/types'

const TAHFIDZ_SUBJECTS = [
    'KELANCARAN', 'FASHOHAH', 'TAJWID', 'SAMBUNG AYAT',
    'TAKLIM KITAB SUBUH', 'TAKLIM KITAB ISYA’'
]

const BEHAVIORS = ['Baik', 'Cukup', 'Kurang', 'Sangat Baik']

export function RaportDialog({ santriList }: { santriList: SantriOption[] }) {
    const [open, setOpen] = useState(false)
    const [isPending, startTransition] = useTransition()
    const [selectedSantriId, setSelectedSantriId] = useState<string>("")

    async function handleSubmit(formData: FormData) {
        if (!selectedSantriId) {
            toast.error("Pilih Santri")
            return
        }
        formData.append('santri_id', selectedSantriId)

        startTransition(async () => {
            const res = await saveRaport(null, formData)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success(res?.message || 'Data berhasil disimpan')
                setOpen(false)
                setSelectedSantriId("")
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <FileText className="mr-2 h-4 w-4" />
                    Input Nilai Raport
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Input Nilai Raport Tahfidz</DialogTitle>
                    <DialogDescription>
                        Masukkan nilai mapel, perilaku, dan presensi untuk raport semester.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleSubmit} className="grid gap-6 py-4">

                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Santri</Label>
                            <Select value={selectedSantriId} onValueChange={setSelectedSantriId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Santri" />
                                </SelectTrigger>
                                <SelectContent>
                                    {santriList?.map((s) => (
                                        <SelectItem key={s.id} value={s.id}>{s.name} ({s.nis})</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tahun Ajaran</Label>
                            <Input name="year" defaultValue={`${new Date().getFullYear()}/${new Date().getFullYear() + 1}`} />
                        </div>
                        <div className="space-y-2">
                            <Label>Semester</Label>
                            <Select name="semester" defaultValue="Ganjil">
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Ganjil">Ganjil</SelectItem>
                                    <SelectItem value="Genap">Genap</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 text-sm text-slate-500 uppercase tracking-wider">Nilai Mata Pelajaran</h4>
                        <div className="grid grid-cols-2 gap-4">
                            {TAHFIDZ_SUBJECTS.map((subj) => (
                                <div key={subj} className="grid grid-cols-[1fr_80px] items-center gap-2">
                                    <Label htmlFor={`score_${subj}`} className="text-xs font-normal truncate" title={subj}>{subj}</Label>
                                    <Input
                                        id={`score_${subj}`}
                                        name={`score_${subj}`}
                                        type="number"
                                        min="0"
                                        max="100"
                                        placeholder="0-100"
                                        className="h-8"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 text-sm text-slate-500 uppercase tracking-wider">Perilaku (Akhlaq)</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Kerajinan</Label>
                                <Select name="behavior_kerajinan" defaultValue="Baik">
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BEHAVIORS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Kedisiplinan</Label>
                                <Select name="behavior_kedisiplinan" defaultValue="Baik">
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BEHAVIORS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Kerapian</Label>
                                <Select name="behavior_kerapian" defaultValue="Baik">
                                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        {BEHAVIORS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-3 text-sm text-slate-500 uppercase tracking-wider">Presensi (Ketidakhadiran)</h4>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label className="text-xs">Sakit (hari)</Label>
                                <Input name="sakit" type="number" min="0" defaultValue="0" className="h-8" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Izin (hari)</Label>
                                <Input name="izin" type="number" min="0" defaultValue="0" className="h-8" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs">Alfa (hari)</Label>
                                <Input name="alfa" type="number" min="0" defaultValue="0" className="h-8" />
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Simpan Raport
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
