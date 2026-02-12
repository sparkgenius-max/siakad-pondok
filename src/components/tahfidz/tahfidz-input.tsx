'use client'

import { useActionState, useEffect } from 'react'
// import { useFormState } from 'react-dom' // Deprecated in newer Next.js for useActionState but let's stick to what's available or use compatible hook
import { createTahfidzRecord } from '@/app/(dashboard)/monitoring-tahfidz/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { toast } from 'sonner'
import { BookOpen, Save } from 'lucide-react'

// Define the shape of the SantriOption type locally if not imported or use 'any' for now if lazy
type SantriOption = {
    id: string;
    name: string;
    nis: string;
}

type State = {
    message?: string;
    error?: string;
}

const initialState: State = {
    message: undefined,
    error: undefined,
}

export function TahfidzInput({ santriList }: { santriList: SantriOption[] }) {
    const [state, formAction] = useActionState(createTahfidzRecord as any, initialState)

    useEffect(() => {
        if (state.message) {
            toast.success(state.message)
            // Optional: Reset form logic here if needed, but HTML form reset is manual
            const form = document.querySelector('form') as HTMLFormElement
            if (form) form.reset()
        }
        if (state.error) {
            toast.error(state.error)
        }
    }, [state])

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    Input Hafalan Baru
                </CardTitle>
                <CardDescription>
                    Catat perkembangan Ziyadah dan Murojaah santri.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form action={formAction} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="santri_id">Santri</Label>
                            <Select name="santri_id" required>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih Santri" />
                                </SelectTrigger>
                                <SelectContent>
                                    {santriList.map((santri) => (
                                        <SelectItem key={santri.id} value={santri.id}>
                                            {santri.name} ({santri.nis})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Tanggal</Label>
                            <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="ziyadah_pages">Ziyadah (Halaman)</Label>
                            <Input type="number" name="ziyadah_pages" placeholder="0" min="0" step="0.5" />
                            <p className="text-[10px] text-muted-foreground">Jumlah halaman baru yang dihafal.</p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="murojaah_juz">Murojaah (Juz)</Label>
                            <Input type="number" name="murojaah_juz" placeholder="0" min="0" step="0.5" />
                            <p className="text-[10px] text-muted-foreground">Juz yang diulang.</p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Catatan (Opsional)</Label>
                        <Textarea name="notes" placeholder="Catatan mengenai kualitas hafalan..." />
                    </div>

                    <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">
                        <Save className="h-4 w-4 mr-2" />
                        Simpan Data
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
