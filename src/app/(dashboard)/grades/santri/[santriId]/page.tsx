import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { ArrowLeft, User, GraduationCap, TrendingUp, Award, BookOpen } from 'lucide-react'
import { GradeDialog } from '@/components/grades/grade-dialog'

export default async function SantriGradesPage({
    params,
}: {
    params: Promise<{ santriId: string }>
}) {
    const { santriId } = await params
    const supabase = await createClient()

    // Fetch santri data
    const { data: santri, error } = await supabase
        .from('santri')
        .select('*')
        .eq('id', santriId)
        .single()

    if (error || !santri) {
        notFound()
    }

    // Fetch all grades for this santri
    const { data: grades } = await supabase
        .from('grades')
        .select('*')
        .eq('santri_id', santriId)
        .order('academic_year', { ascending: false })
        .order('semester', { ascending: false })
        .order('subject', { ascending: true })

    // Get santri list for dialog (just this one)
    const santriList = [{ id: santri.id, name: santri.name, nis: santri.nis }]

    // Group grades by semester
    const gradesBySemester: Record<string, any[]> = {}
    grades?.forEach(g => {
        const key = `${g.academic_year} - ${g.semester}`
        if (!gradesBySemester[key]) {
            gradesBySemester[key] = []
        }
        gradesBySemester[key].push(g)
    })

    // Calculate overall stats
    const totalGrades = grades?.length || 0
    const allNumericGrades = grades?.map(g => parseInt(g.grade)).filter(g => !isNaN(g)) || []
    const overallAvg = allNumericGrades.length > 0
        ? Math.round(allNumericGrades.reduce((a, b) => a + b, 0) / allNumericGrades.length)
        : null
    const highestGrade = allNumericGrades.length > 0 ? Math.max(...allNumericGrades) : null
    const lowestGrade = allNumericGrades.length > 0 ? Math.min(...allNumericGrades) : null

    // Get unique subjects
    const uniqueSubjects = [...new Set(grades?.map(g => g.subject))]

    // Get grade color
    const getGradeColor = (grade: string) => {
        const numGrade = parseInt(grade)
        if (!isNaN(numGrade)) {
            if (numGrade >= 85) return 'text-green-600 bg-green-50'
            if (numGrade >= 70) return 'text-blue-600 bg-blue-50'
            if (numGrade >= 55) return 'text-yellow-600 bg-yellow-50'
            return 'text-red-600 bg-red-50'
        }
        if (['A', 'A+', 'A-'].includes(grade.toUpperCase())) return 'text-green-600 bg-green-50'
        if (['B', 'B+', 'B-'].includes(grade.toUpperCase())) return 'text-blue-600 bg-blue-50'
        if (['C', 'C+', 'C-'].includes(grade.toUpperCase())) return 'text-yellow-600 bg-yellow-50'
        return 'text-red-600 bg-red-50'
    }

    const getGradeLabel = (avg: number) => {
        if (avg >= 85) return { label: 'Sangat Baik', color: 'bg-green-100 text-green-800' }
        if (avg >= 70) return { label: 'Baik', color: 'bg-blue-100 text-blue-800' }
        if (avg >= 55) return { label: 'Cukup', color: 'bg-yellow-100 text-yellow-800' }
        return { label: 'Perlu Perbaikan', color: 'bg-red-100 text-red-800' }
    }

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/grades">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight">Rekap Nilai</h2>
                        <p className="text-muted-foreground">{santri.name} ({santri.nis}) • {santri.class}</p>
                    </div>
                </div>
                <GradeDialog santriList={santriList} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-5">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Info Santri</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold">{santri.class}</div>
                        <p className="text-xs text-muted-foreground">{santri.dorm || 'Asrama belum ditentukan'}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalGrades}</div>
                        <p className="text-xs text-muted-foreground">nilai tercatat</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Rata-rata</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{overallAvg ?? '-'}</div>
                        {overallAvg !== null && (
                            <Badge className={getGradeLabel(overallAvg).color}>
                                {getGradeLabel(overallAvg).label}
                            </Badge>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nilai Tertinggi</CardTitle>
                        <Award className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{highestGrade ?? '-'}</div>
                        <p className="text-xs text-muted-foreground">poin</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Nilai Terendah</CardTitle>
                        <BookOpen className="h-4 w-4 text-red-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600">{lowestGrade ?? '-'}</div>
                        <p className="text-xs text-muted-foreground">poin</p>
                    </CardContent>
                </Card>
            </div>

            {/* Grades by Semester */}
            <div className="space-y-4">
                {Object.entries(gradesBySemester).map(([semester, semesterGrades]) => {
                    const numericGrades = semesterGrades.map(g => parseInt(g.grade)).filter(g => !isNaN(g))
                    const semesterAvg = numericGrades.length > 0
                        ? Math.round(numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length)
                        : null

                    return (
                        <Card key={semester}>
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-lg">{semester}</CardTitle>
                                        <CardDescription>{semesterGrades.length} mata pelajaran</CardDescription>
                                    </div>
                                    {semesterAvg !== null && (
                                        <div className="text-right">
                                            <div className="text-sm text-muted-foreground">Rata-rata</div>
                                            <Badge className={`${getGradeColor(String(semesterAvg))} text-lg px-3`}>
                                                {semesterAvg}
                                            </Badge>
                                        </div>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">No</TableHead>
                                            <TableHead>Mata Pelajaran</TableHead>
                                            <TableHead className="text-center">Nilai</TableHead>
                                            <TableHead>Keterangan</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {semesterGrades.map((g: any, index: number) => {
                                            const numGrade = parseInt(g.grade)
                                            let keterangan = '-'
                                            if (!isNaN(numGrade)) {
                                                if (numGrade >= 85) keterangan = 'Sangat Baik'
                                                else if (numGrade >= 70) keterangan = 'Baik'
                                                else if (numGrade >= 55) keterangan = 'Cukup'
                                                else keterangan = 'Perlu Perbaikan'
                                            }

                                            return (
                                                <TableRow key={g.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell className="font-medium">{g.subject}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={`${getGradeColor(g.grade)} font-bold text-lg px-3`}>
                                                            {g.grade}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">{keterangan}</TableCell>
                                                    <TableCell className="text-right">
                                                        <GradeDialog santriList={santriList} grade={g} />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )
                })}

                {Object.keys(gradesBySemester).length === 0 && (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Belum Ada Nilai</h3>
                            <p className="text-muted-foreground">Santri ini belum memiliki data nilai.</p>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Subject Summary */}
            {uniqueSubjects.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Ringkasan Per Mata Pelajaran</CardTitle>
                        <CardDescription>Rata-rata nilai per mata pelajaran sepanjang waktu</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                            {uniqueSubjects.map(subject => {
                                const subjectGrades = grades?.filter(g => g.subject === subject) || []
                                const numericGrades = subjectGrades.map(g => parseInt(g.grade)).filter(g => !isNaN(g))
                                const avgGrade = numericGrades.length > 0
                                    ? Math.round(numericGrades.reduce((a, b) => a + b, 0) / numericGrades.length)
                                    : null

                                return (
                                    <div key={subject} className={`rounded-lg p-3 ${avgGrade ? getGradeColor(String(avgGrade)) : 'bg-gray-50'}`}>
                                        <div className="text-xs font-medium truncate" title={subject}>{subject}</div>
                                        <div className="text-xl font-bold">{avgGrade ?? '-'}</div>
                                        <div className="text-xs opacity-70">{subjectGrades.length} nilai</div>
                                    </div>
                                )
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
