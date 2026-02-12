'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { upsertBulkGrades } from '@/app/(dashboard)/grades/actions'
import { Loader2, Save } from 'lucide-react'
import Link from 'next/link'

interface BulkGradeFormProps {
    santriList: any[]
    existingGrades: any[]
    subject: string
    semester: string
    academicYear: string
    programType: 'Diniyah' | 'Tahfidz'
}

export function BulkGradeForm({
    santriList,
    existingGrades,
    subject,
    semester,
    academicYear,
    programType
}: BulkGradeFormProps) {
    const [grades, setGrades] = useState<Record<string, any>>({})
    const [isSaving, setIsSaving] = useState(false)
    const [hasChanges, setHasChanges] = useState(false)

    // Initialize grades from existing data
    useEffect(() => {
        const initialGrades: Record<string, any> = {}

        santriList.forEach(santri => {
            const existing = existingGrades.find(g => g.santri_id === santri.id)
            if (existing) {
                initialGrades[santri.id] = {
                    theory: existing.score_theory || 0,
                    practice: existing.score_practice || 0,
                    total: existing.score_total || 0,
                    id: existing.id // Keep ID for updates if needed, though upsert handles it
                }
            } else {
                initialGrades[santri.id] = {
                    theory: 0,
                    practice: 0,
                    total: 0
                }
            }
        })
        setGrades(initialGrades)
        setHasChanges(false)
    }, [santriList, existingGrades, subject]) // Reset when subject changes

    const handleInputChange = (santriId: string, field: 'theory' | 'practice' | 'total', value: string) => {
        const numValue = Math.min(100, Math.max(0, Number(value) || 0)) // Clamp 0-100

        setGrades(prev => {
            const current = prev[santriId] || { theory: 0, practice: 0, total: 0 }
            let updated = { ...current }

            if (field === 'total') {
                updated.total = numValue
                // For Tahfidz, we can store same value in theory/practice or just 0
                // Let's store 0 for theory/practice to avoid confusion, or store the value in theory?
                // Better to just rely on total.
                updated.theory = 0
                updated.practice = 0
            } else {
                updated[field] = numValue
                // Recalculate Total for Diniyah
                updated.total = Math.round((updated.theory + updated.practice) / 2)
            }

            return { ...prev, [santriId]: updated }
        })
        setHasChanges(true)
    }

    const handleSave = async () => {
        setIsSaving(true)

        const payload = Object.entries(grades).map(([santriId, grade]) => ({
            santri_id: santriId,
            subject: subject,
            semester: semester,
            academic_year: academicYear,
            program_type: programType,
            score_theory: grade.theory,
            score_practice: grade.practice,
            score_total: grade.total,
        }))

        const result = await upsertBulkGrades(payload)

        if (result.error) {
            toast.error('Gagal menyimpan nilai: ' + result.error)
        } else {
            toast.success(`Berhasil menyimpan nilai untuk ${result.count} santri.`)
            setHasChanges(false)
        }

        setIsSaving(false)
    }

    const getGradeColor = (grade: number) => {
        if (grade >= 85) return 'text-green-600 bg-green-50'
        if (grade >= 70) return 'text-blue-600 bg-blue-50'
        if (grade >= 55) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
                <div className="text-sm text-muted-foreground">
                    Input Nilai untuk Mata Pelajaran: <span className="font-bold text-slate-900">{subject}</span>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    className={hasChanges ? "animate-pulse" : ""}
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Semua Perubahan
                </Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[50px]">No</TableHead>
                            <TableHead className="w-[250px]">Nama Santri</TableHead>
                            {programType === 'Tahfidz' ? (
                                <TableHead className="w-[150px]">
                                    <div className="w-full text-center">Nilai</div>
                                </TableHead>
                            ) : (
                                <>
                                    <TableHead className="text-center w-[150px]">Nilai Teori</TableHead>
                                    <TableHead className="text-center w-[150px]">Nilai Praktek</TableHead>
                                </>
                            )}
                            {programType === 'Diniyah' && (
                                <TableHead className="text-center w-[100px]">Total</TableHead>
                            )}
                            <TableHead className="text-center w-[100px]">Predikat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {santriList.map((s, index) => {
                            const grade = grades[s.id] || { theory: 0, practice: 0, total: 0 }
                            return (
                                <TableRow key={s.id}>
                                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                                    <TableCell>
                                        <Link href={`/santri/${s.id}`} className="hover:underline cursor-pointer" target="_blank">
                                            <div className="font-medium text-slate-900">{s.name}</div>
                                        </Link>
                                        <div className="text-xs text-muted-foreground">{s.nis}</div>
                                    </TableCell>

                                    {programType === 'Tahfidz' ? (
                                        <TableCell>
                                            <div className="flex justify-center w-full">
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="text-center font-bold text-lg h-10 w-24"
                                                    value={grade.total || ''}
                                                    onChange={(e) => handleInputChange(s.id, 'total', e.target.value)}
                                                />
                                            </div>
                                        </TableCell>
                                    ) : (
                                        <>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="text-center"
                                                    value={grade.theory || ''}
                                                    onChange={(e) => handleInputChange(s.id, 'theory', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    className="text-center"
                                                    value={grade.practice || ''}
                                                    onChange={(e) => handleInputChange(s.id, 'practice', e.target.value)}
                                                />
                                            </TableCell>
                                            <TableCell className="text-center font-bold text-lg">
                                                {grade.total}
                                            </TableCell>
                                        </>
                                    )}

                                    <TableCell className="text-center">
                                        <Badge variant="outline" className={`border-none ${getGradeColor(grade.total)}`}>
                                            {grade.total >= 85 ? 'Mumtaz' :
                                                grade.total >= 75 ? 'Jayyid Jiddan' :
                                                    grade.total >= 60 ? 'Jayyid' :
                                                        grade.total >= 50 ? 'Maqbul' : 'Rasib'}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )
                        })}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-end mt-4">
                <Button
                    onClick={handleSave}
                    disabled={!hasChanges || isSaving}
                    size="lg"
                >
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Semua Nilai
                </Button>
            </div>
        </div>
    )
}
