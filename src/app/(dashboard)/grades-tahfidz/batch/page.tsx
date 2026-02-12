import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { ArrowLeft, BookOpen, Users } from 'lucide-react'
import Link from 'next/link'
import { BatchTahfidzGradeForm } from '@/components/grades/batch-tahfidz-grade-form'

const TAHFIDZ_SUBJECTS = [
    'KELANCARAN',
    'FASHOHAH',
    'TAJWID',
    'SAMBUNGAYAT',
    'TAKLIM KITAB SUBUH',
    "TAKLIM KITAB ISYA'",
]

const SEMESTERS = [
    { value: 'Ganjil', label: 'Ganjil (Semester 1)' },
    { value: 'Genap', label: 'Genap (Semester 2)' },
]

export const dynamic = 'force-dynamic'

export default async function BatchTahfidzGradePage({
    searchParams,
}: {
    searchParams: Promise<{ class?: string; subject?: string; semester?: string; year?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    const currentYear = new Date().getFullYear()
    const selectedClass = params.class || ''
    const selectedSubject = params.subject || ''
    const selectedSemester = params.semester || 'Ganjil'
    const selectedYear = params.year || `${currentYear}/${currentYear + 1}`

    // Get unique classes for Tahfidz santri only
    const { data: classesData } = await supabase
        .from('santri')
        .select('class')
        .eq('status', 'active')
        .eq('program', 'Tahfidz')
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort()

    // Get Tahfidz santri for selected class
    let classSantri: any[] = []
    let existingGrades: any[] = []

    if (selectedClass && selectedSubject) {
        const { data: santriData } = await supabase
            .from('santri')
            .select('id, name, nis')
            .eq('class', selectedClass)
            .eq('status', 'active')
            .eq('program', 'Tahfidz')
            .order('name')
        classSantri = santriData || []

        // Get existing grades for this class/subject/semester
        const santriIds = classSantri.map(s => s.id)
        if (santriIds.length > 0) {
            const { data: gradesData } = await supabase
                .from('grades')
                .select('*')
                .in('santri_id', santriIds)
                .eq('subject', selectedSubject)
                .eq('semester', selectedSemester)
                .eq('academic_year', selectedYear)
                .eq('program_type', 'Tahfidz')
            existingGrades = gradesData || []
        }
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/grades-tahfidz">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Input Nilai Batch Tahfidz</h2>
                    <p className="text-muted-foreground">Input nilai tahfidz sekaligus per kelas dan mata pelajaran</p>
                </div>
            </div>

            {/* Filter Card */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Pilih Kelas dan Mata Pelajaran
                    </CardTitle>
                    <CardDescription>Pilih kelas, mapel, dan periode untuk input nilai batch</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="flex items-center gap-4 flex-wrap">
                        <Select name="class" defaultValue={selectedClass}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Pilih Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueClasses.map(cls => (
                                    <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="subject" defaultValue={selectedSubject}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Mapel" />
                            </SelectTrigger>
                            <SelectContent>
                                {TAHFIDZ_SUBJECTS.map(subj => (
                                    <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="semester" defaultValue={selectedSemester}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {SEMESTERS.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select name="year" defaultValue={selectedYear}>
                            <SelectTrigger className="w-[140px]">
                                <SelectValue placeholder="Tahun" />
                            </SelectTrigger>
                            <SelectContent>
                                {[`${currentYear}/${currentYear + 1}`, `${currentYear - 1}/${currentYear}`].map(y => (
                                    <SelectItem key={y} value={y}>{y}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Button type="submit">Tampilkan</Button>
                    </form>
                </CardContent>
            </Card>

            {/* Batch Input Form */}
            {selectedClass && selectedSubject ? (
                classSantri.length > 0 ? (
                    <BatchTahfidzGradeForm
                        santriList={classSantri}
                        existingGrades={existingGrades}
                        subject={selectedSubject}
                        semester={selectedSemester}
                        academicYear={selectedYear}
                        className={selectedClass}
                    />
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Tidak Ada Santri Tahfidz</h3>
                            <p className="text-muted-foreground">Tidak ada santri Tahfidz aktif di kelas {selectedClass}</p>
                        </CardContent>
                    </Card>
                )
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Pilih Kelas dan Mata Pelajaran</h3>
                        <p className="text-muted-foreground">Silakan pilih kelas dan mata pelajaran untuk mulai input nilai</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
