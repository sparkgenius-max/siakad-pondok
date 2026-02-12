'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Play } from 'lucide-react'
import { useTransition } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface BulkInputFilterProps {
    classes: string[]
    subjects: string[]
    years: string[]
    semesters: { value: string; label: string }[]
    activeProgram: string
}

export function BulkInputFilter({
    classes,
    subjects,
    years,
    semesters,
    activeProgram,
}: BulkInputFilterProps) {
    const router = useRouter()
    const searchParams = useSearchParams()
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isPending, startTransition] = useTransition()

    // Get current values from URL
    const currentClass = searchParams.get('batch_class') || ''
    const currentSubject = searchParams.get('batch_subject') || ''
    const currentYear = searchParams.get('batch_year') || ''
    const currentSemester = searchParams.get('batch_semester') || 'Ganjil'

    const updateFilter = (key: string, value: string) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('tab', 'class')
        params.set('program', activeProgram)

        if (value && value !== 'all') {
            params.set(key, value)
        } else {
            params.delete(key)
        }

        startTransition(() => {
            router.push(`/grades?${params.toString()}`, { scroll: false })
        })
    }

    return (
        <Card className="mb-6">
            <CardHeader className="pb-3 border-b bg-slate-50/50">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Play className="w-4 h-4 text-emerald-600" />
                    Mulai Input Nilai Masal
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
                <div className="flex flex-wrap items-end gap-4">
                    {activeProgram === 'Diniyah' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Kelas
                            </label>
                            <Select
                                value={currentClass}
                                onValueChange={(v) => updateFilter('batch_class', v)}
                            >
                                <SelectTrigger className="w-[160px]">
                                    <SelectValue placeholder="Pilih Kelas" />
                                </SelectTrigger>
                                <SelectContent>
                                    {classes.map(c => (
                                        <SelectItem key={c} value={c}>Kelas {c}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Mata Pelajaran
                        </label>
                        <Select
                            value={currentSubject}
                            onValueChange={(v) => updateFilter('batch_subject', v)}
                        >
                            <SelectTrigger className="w-[220px]">
                                <SelectValue placeholder="Pilih Mapel" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => (
                                    <SelectItem key={s} value={s}>{s}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Tahun Ajaran
                        </label>
                        <Select
                            value={currentYear}
                            onValueChange={(v) => updateFilter('batch_year', v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Semua Tahun</SelectItem>
                                {years.map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                            Semester
                        </label>
                        <Select
                            value={currentSemester}
                            onValueChange={(v) => updateFilter('batch_semester', v)}
                        >
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {semesters.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
