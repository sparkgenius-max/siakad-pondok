'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Save, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { saveBatchGrades } from '@/app/(dashboard)/grades/actions'

interface SantriOption {
    id: string
    name: string
    nis: string
}

interface ExistingGrade {
    id: string
    santri_id: string
    score_theory: number
    score_practice: number
    notes: string | null
}

interface BatchGradeFormProps {
    santriList: SantriOption[]
    existingGrades: ExistingGrade[]
    subject: string
    semester: string
    academicYear: string
    className: string
}

interface GradeEntry {
    santri_id: string
    score_theory: string
    score_practice: string
    notes: string
    existing_id?: string
}

export function BatchGradeForm({
    santriList,
    existingGrades,
    subject,
    semester,
    academicYear,
    className
}: BatchGradeFormProps) {
    const [grades, setGrades] = useState<Record<string, GradeEntry>>(() => {
        const initial: Record<string, GradeEntry> = {}
        santriList.forEach(santri => {
            const existing = existingGrades.find(g => g.santri_id === santri.id)
            initial[santri.id] = {
                santri_id: santri.id,
                score_theory: existing?.score_theory?.toString() || '',
                score_practice: existing?.score_practice?.toString() || '',
                notes: existing?.notes || '',
                existing_id: existing?.id
            }
        })
        return initial
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const updateScore = (santriId: string, field: 'score_theory' | 'score_practice' | 'notes', value: string) => {
        setGrades(prev => ({
            ...prev,
            [santriId]: { ...prev[santriId], [field]: value }
        }))
        setSaved(false)
    }

    const handleSubmit = async () => {
        setSaving(true)

        // Filter entries that have at least one score
        const gradesToSave = Object.values(grades).filter(g =>
            g.score_theory.trim() !== '' || g.score_practice.trim() !== ''
        )

        if (gradesToSave.length === 0) {
            toast.error('Tidak ada nilai untuk disimpan')
            setSaving(false)
            return
        }

        const result = await saveBatchGrades({
            grades: gradesToSave,
            subject,
            semester,
            academic_year: academicYear
        })

        setSaving(false)

        if (result.error) {
            toast.error(result.error)
        } else {
            toast.success(result.message || 'Nilai berhasil disimpan')
            setSaved(true)
        }
    }

    // Calculate stats
    const filledCount = Object.values(grades).filter(g =>
        g.score_theory.trim() !== '' || g.score_practice.trim() !== ''
    ).length
    const existingCount = existingGrades.length

    const getGradeColor = (theoryStr: string, practiceStr: string) => {
        const t = parseFloat(theoryStr) || 0
        const p = parseFloat(practiceStr) || 0
        if (!theoryStr && !practiceStr) return 'text-slate-300'

        const avg = (t + p) / 2
        if (avg >= 85) return 'text-emerald-600'
        if (avg >= 75) return 'text-blue-600'
        if (avg >= 65) return 'text-orange-600'
        return 'text-red-600'
    }

    return (
        <Card className="border-none shadow-md overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 py-4">
                <div>
                    <CardTitle className="text-xl">
                        Batch Input: {className} - {subject}
                    </CardTitle>
                    <CardDescription>
                        {semester} {academicYear} • {filledCount} dari {santriList.length} santri terisi
                        {existingCount > 0 && (
                            <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-none">
                                {existingCount} data lama
                            </Badge>
                        )}
                    </CardDescription>
                </div>
                <Button onClick={handleSubmit} disabled={saving} className="bg-blue-600 hover:bg-blue-700 h-10 px-6">
                    {saving ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Menyimpan...</>
                    ) : saved ? (
                        <><CheckCircle className="mr-2 h-4 w-4" />Tersimpan</>
                    ) : (
                        <><Save className="mr-2 h-4 w-4" />Simpan Semua</>
                    )}
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-slate-50/80">
                            <TableRow>
                                <TableHead className="w-[60px] text-center font-bold">No</TableHead>
                                <TableHead className="w-[120px] font-bold">NIS</TableHead>
                                <TableHead className="min-w-[200px] font-bold">Nama Santri</TableHead>
                                <TableHead className="w-[100px] text-center font-bold">Teori</TableHead>
                                <TableHead className="w-[100px] text-center font-bold">Praktek</TableHead>
                                <TableHead className="w-[80px] text-center font-bold">Total</TableHead>
                                <TableHead className="font-bold">Catatan</TableHead>
                                <TableHead className="w-[100px] text-center font-bold">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {santriList.map((santri, index) => {
                                const entry = grades[santri.id]
                                const hasExisting = !!entry?.existing_id

                                const theory = parseFloat(entry?.score_theory) || 0
                                const practice = parseFloat(entry?.score_practice) || 0
                                const total = (theory + practice) / 2
                                const hasValue = (entry?.score_theory && entry.score_theory.trim() !== '') ||
                                    (entry?.score_practice && entry.score_practice.trim() !== '')

                                return (
                                    <TableRow key={santri.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell className="text-muted-foreground text-center font-mono text-xs">{index + 1}</TableCell>
                                        <TableCell className="font-mono text-xs text-slate-500">{santri.nis}</TableCell>
                                        <TableCell className="font-medium text-sm">{santri.name}</TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                value={entry?.score_theory || ''}
                                                onChange={(e) => updateScore(santri.id, 'score_theory', e.target.value)}
                                                className="text-center h-9 focus-visible:ring-blue-500 bg-white border-slate-200"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="0"
                                                value={entry?.score_practice || ''}
                                                onChange={(e) => updateScore(santri.id, 'score_practice', e.target.value)}
                                                className="text-center h-9 focus-visible:ring-blue-500 bg-white border-slate-200"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <span className={`font-bold text-sm ${getGradeColor(entry?.score_theory, entry?.score_practice)}`}>
                                                {hasValue ? total.toFixed(1) : '-'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                placeholder="Catatan..."
                                                value={entry?.notes || ''}
                                                onChange={(e) => updateScore(santri.id, 'notes', e.target.value)}
                                                className="h-9 focus-visible:ring-blue-500 bg-white border-slate-200"
                                            />
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {hasExisting ? (
                                                <Badge variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">
                                                    Update
                                                </Badge>
                                            ) : hasValue ? (
                                                <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-medium">
                                                    Baru
                                                </Badge>
                                            ) : (
                                                <Badge variant="outline" className="text-[10px] text-slate-400 border-slate-200 font-medium">
                                                    Kosong
                                                </Badge>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                )
                            })}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    )
}
