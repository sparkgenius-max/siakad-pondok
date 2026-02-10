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
    grade: string
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
    grade: string
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
                grade: existing?.grade || '',
                notes: existing?.notes || '',
                existing_id: existing?.id
            }
        })
        return initial
    })
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    const updateGrade = (santriId: string, field: 'grade' | 'notes', value: string) => {
        setGrades(prev => ({
            ...prev,
            [santriId]: { ...prev[santriId], [field]: value }
        }))
        setSaved(false)
    }

    const handleSubmit = async () => {
        setSaving(true)

        // Filter only entries with grades
        const gradesToSave = Object.values(grades).filter(g => g.grade.trim() !== '')

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
    const filledCount = Object.values(grades).filter(g => g.grade.trim() !== '').length
    const existingCount = existingGrades.length

    // Grade color helper
    const getGradeColor = (grade: string) => {
        const num = parseInt(grade)
        if (isNaN(num)) return ''
        if (num >= 90) return 'text-green-600 font-semibold'
        if (num >= 80) return 'text-blue-600'
        if (num >= 70) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        Input Nilai: Kelas {className} - {subject}
                    </CardTitle>
                    <CardDescription>
                        {semester} {academicYear} • {filledCount} dari {santriList.length} santri
                        {existingCount > 0 && (
                            <Badge variant="secondary" className="ml-2">
                                {existingCount} sudah ada
                            </Badge>
                        )}
                    </CardDescription>
                </div>
                <Button onClick={handleSubmit} disabled={saving}>
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
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead className="w-[100px]">NIS</TableHead>
                            <TableHead>Nama Santri</TableHead>
                            <TableHead className="w-[120px] text-center">Nilai</TableHead>
                            <TableHead>Catatan</TableHead>
                            <TableHead className="w-[80px] text-center">Status</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {santriList.map((santri, index) => {
                            const entry = grades[santri.id]
                            const hasExisting = !!entry?.existing_id

                            return (
                                <TableRow key={santri.id}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell className="font-mono text-sm">{santri.nis}</TableCell>
                                    <TableCell className="font-medium">{santri.name}</TableCell>
                                    <TableCell>
                                        <Input
                                            type="number"
                                            min="0"
                                            max="100"
                                            placeholder="0-100"
                                            value={entry?.grade || ''}
                                            onChange={(e) => updateGrade(santri.id, 'grade', e.target.value)}
                                            className={`text-center ${getGradeColor(entry?.grade || '')}`}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Input
                                            placeholder="Catatan opsional..."
                                            value={entry?.notes || ''}
                                            onChange={(e) => updateGrade(santri.id, 'notes', e.target.value)}
                                        />
                                    </TableCell>
                                    <TableCell className="text-center">
                                        {hasExisting ? (
                                            <Badge variant="outline" className="text-green-600 border-green-300">
                                                Ada
                                            </Badge>
                                        ) : entry?.grade ? (
                                            <Badge variant="outline" className="text-blue-600 border-blue-300">
                                                Baru
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="text-muted-foreground">
                                                Kosong
                                            </Badge>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
