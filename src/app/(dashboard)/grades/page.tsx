import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { GradeDialog } from '@/components/grades/grade-dialog'
import { TahfidzGradeDialog } from '@/components/grades/tahfidz-grade-dialog'
import { BulkGradeForm } from '@/components/grades/bulk-grade-form'
import { GradesFilter } from '@/components/grades/grades-filter'
import { BulkInputFilter } from '@/components/grades/bulk-input-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Search, GraduationCap, BookOpen, Users, TrendingUp } from 'lucide-react'
import { PaginationLimit } from '@/components/layout/pagination-limit'

import { ACADEMIC_YEARS, SEMESTERS, DINIYAH_SUBJECTS, TAHFIDZ_SUBJECTS } from '@/lib/constants'

export const dynamic = 'force-dynamic'

export default async function GradesPage({
    searchParams,
}: {
    searchParams: Promise<{
        page?: string;
        q?: string;
        tab?: string;
        class?: string;
        semester?: string;
        year?: string;
        limit?: string;
        program?: string;
        subject?: string;
        batch_class?: string;
        batch_subject?: string;
        batch_year?: string;
        batch_semester?: string;
    }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 20
    const from = (page - 1) * limit
    const to = from + limit - 1

    // Main Tab: Diniyah vs Tahfidz
    const activeProgram = params.program === 'Tahfidz' ? 'Tahfidz' : 'Diniyah'
    const activeViewTab = params.tab || 'all' // all or class

    const currentYear = new Date().getFullYear()

    // Main Filter Params
    const selectedYear = params.year || 'all'
    const selectedSemester = params.semester || 'Ganjil'
    const selectedClass = params.class || ''

    // Batch Filter Params
    const batchClass = params.batch_class || ''
    const batchSubject = params.batch_subject || ''
    const batchYear = params.batch_year || 'all'
    const batchSemester = params.batch_semester || 'Ganjil'

    // Fetch correct Santri based on Active Program
    // Use Admin Client to bypass RLS for critical dropdown data
    const adminDb = createAdminClient()
    const { data: santriList } = await adminDb
        .from('santri')
        .select('id, name, nis, class')
        .eq('status', 'active')
        .eq('program', activeProgram)
        .order('name')

    const { data: classesData } = await adminDb
        .from('santri')
        .select('class')
        .eq('status', 'active')
        .eq('program', activeProgram)
    // Get Unique Classes and Sort them (Ula -> Wustha -> Ulya)
    const diniyahOrder = ['Ula', 'Wustha', 'Ulya']
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort((a, b) => {
        const indexA = diniyahOrder.indexOf(a)
        const indexB = diniyahOrder.indexOf(b)
        // If both are in the known order list, compare indices
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        // If only A is known, it comes first
        if (indexA !== -1) return -1
        // If only B is known, it comes first
        if (indexB !== -1) return 1
        // Fallback to alphabetical
        return a.localeCompare(b)
    })

    // Query Grades based on Active Program using Admin Client
    let query = adminDb
        .from('grades')
        .select('*, santri(id, name, nis, class)', { count: 'exact' })
        .eq('program_type', activeProgram)
        .order('created_at', { ascending: false })
        .range(from, to)

    if (params.q) {
        query = query.ilike('subject', `%${params.q}%`)
    }

    if (params.subject && params.subject !== 'all') {
        query = query.eq('subject', params.subject)
    }

    if (params.class && params.class !== 'all') {
        // Filter by class requires joining with santri, but supabase simple query can't do deep filter easily on join without !inner
        // We need to use !inner hint on santri join if we want to filter by santri's class
        // Changing the select to use inner join for filtering
        query = adminDb
            .from('grades')
            .select('*, santri!inner(id, name, nis, class)', { count: 'exact' })
            .eq('program_type', activeProgram)
            .eq('santri.class', params.class)
            .range(from, to)
            .order('created_at', { ascending: false })

        // Re-apply other filters since we reset query
        if (params.q) query = query.ilike('subject', `%${params.q}%`)
        if (params.subject && params.subject !== 'all') query = query.eq('subject', params.subject)
    }

    if (params.year && params.year !== 'all') {
        query = query.eq('academic_year', params.year)
    }

    if (params.semester) {
        query = query.eq('semester', params.semester)
    }

    const { data: grades, count } = await query
    const totalPages = count ? Math.ceil(count / limit) : 0

    // Class View Data (or "Input Mode" for Tahfidz)
    let classSantri: any[] = []
    let classGrades: any[] = []

    // For Tahfidz, we show ALL students in the "Input" tab (since no classes)
    // For Diniyah, we only show if a class is selected
    // NOW USING BATCH PARAMS
    const shouldFetchInputData = (activeProgram === 'Tahfidz') || (activeProgram === 'Diniyah' && batchClass)

    if (shouldFetchInputData) {
        let santriQuery = adminDb
            .from('santri')
            .select('id, name, nis, class')
            .eq('status', 'active')
            .eq('program', activeProgram)
            .order('name')

        // Only filter by class for Diniyah
        if (activeProgram === 'Diniyah' && batchClass) {
            santriQuery = santriQuery.eq('class', batchClass)
        }

        const { data: santriData } = await santriQuery
        classSantri = santriData || []

        const santriIds = classSantri.map(s => s.id)
        if (santriIds.length > 0) {
            let gradesQuery = adminDb
                .from('grades')
                .select('*')
                .in('santri_id', santriIds)
                .eq('semester', batchSemester)
                .eq('program_type', activeProgram)

            if (batchYear !== 'all') {
                gradesQuery = gradesQuery.eq('academic_year', batchYear)
            }

            // Filter by subject if selected (for Bulk Input)
            if (batchSubject) {
                gradesQuery = gradesQuery.eq('subject', batchSubject)
            }

            const { data: gradesData } = await gradesQuery
            classGrades = gradesData || []
        }
    }

    const { count: totalGrades } = await adminDb
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .eq('program_type', activeProgram)

    const buildUrl = (newParams: Record<string, string | number>) => {
        const urlParams = new URLSearchParams()
        // Default program param if not present
        if (!params.program) urlParams.set('program', 'Diniyah')

        // Preserve current batch params if switching pagination within separate context?
        // Actually pagination is global for now, but mainly affects "All Grades".
        // Let's just merge params.
        const merged = { ...params, ...newParams }
        Object.entries(merged).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') urlParams.set(k, String(v))
        })
        return `/grades?${urlParams.toString()}`
    }

    const getGradeColor = (grade: number | string | undefined | null) => {
        const numGrade = typeof grade === 'number' ? grade : parseFloat(String(grade))
        if (!isNaN(numGrade)) {
            if (numGrade >= 85) return 'text-green-600 bg-green-50'
            if (numGrade >= 70) return 'text-blue-600 bg-blue-50'
            if (numGrade >= 55) return 'text-yellow-600 bg-yellow-50'
            return 'text-red-600 bg-red-50'
        }
        return 'text-gray-600 bg-gray-50'
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nilai {activeProgram}</h2>
                <div className="flex items-center gap-2">

                    {activeProgram === 'Tahfidz' ? (
                        <TahfidzGradeDialog santriList={santriList || []} />
                    ) : (
                        <GradeDialog santriList={santriList || []} />
                    )}
                </div>
            </div>

            {/* PROGRAM TABS */}
            <div className="flex space-x-2 border-b">
                <Link
                    href={buildUrl({ program: 'Diniyah', page: 1, q: '' })}
                    className={`pb-2 px-4 text-sm font-medium transition-colors hover:text-emerald-600 ${activeProgram === 'Diniyah'
                        ? 'border-b-2 border-emerald-600 text-emerald-600'
                        : 'text-muted-foreground'
                        }`}
                >
                    Diniyah
                </Link>
                <Link
                    href={buildUrl({ program: 'Tahfidz', page: 1, q: '' })}
                    className={`pb-2 px-4 text-sm font-medium transition-colors hover:text-cyan-600 ${activeProgram === 'Tahfidz'
                        ? 'border-b-2 border-cyan-600 text-cyan-600'
                        : 'text-muted-foreground'
                        }`}
                >
                    Tahfidz
                </Link>
            </div>

            <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Total Nilai</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{totalGrades || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Santri</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{santriList?.length || 0}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Kelas</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">{uniqueClasses.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1">
                        <CardTitle className="text-xs md:text-sm font-medium">Mapel</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-xl md:text-2xl font-bold">
                            {activeProgram === 'Tahfidz' ? TAHFIDZ_SUBJECTS.length : DINIYAH_SUBJECTS.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={activeViewTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full md:w-auto">
                    <TabsTrigger value="all" asChild>
                        <Link href={buildUrl({ tab: 'all', page: 1 })}>Semua Nilai</Link>
                    </TabsTrigger>
                    <TabsTrigger value="class" asChild>
                        <Link href={buildUrl({ tab: 'class' })}>Input Masal</Link>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <GradesFilter
                        programs={['Diniyah', 'Tahfidz']}
                        classes={uniqueClasses}
                        subjects={activeProgram === 'Tahfidz' ? TAHFIDZ_SUBJECTS : DINIYAH_SUBJECTS}
                        years={ACADEMIC_YEARS}
                        semesters={SEMESTERS}
                        activeProgram={activeProgram}
                    />

                    <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                        <CardContent className="p-0">
                            {/* Desktop Table - Dynamic Columns based on Program */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Santri</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead>Mapel</TableHead>
                                            {activeProgram === 'Diniyah' && (
                                                <>
                                                    <TableHead className="text-center">Teori</TableHead>
                                                    <TableHead className="text-center">Praktek</TableHead>
                                                </>
                                            )}
                                            <TableHead className="text-center">Total</TableHead>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>Tahun Ajaran</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {grades?.length ? (
                                            grades.map((g: any) => (
                                                <TableRow key={g.id}>
                                                    <TableCell>
                                                        <Link href={`/santri/${g.santri?.id}`} className="hover:underline cursor-pointer">
                                                            <div className="font-semibold text-slate-900">{g.santri?.name}</div>
                                                        </Link>
                                                        <div className="text-[10px] text-muted-foreground font-mono">{g.santri?.nis}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">Kelas {g.santri?.class}</TableCell>
                                                    <TableCell className="whitespace-nowrap font-medium text-slate-800">{g.subject}</TableCell>
                                                    {activeProgram === 'Diniyah' && (
                                                        <>
                                                            <TableCell className="text-center text-sm">{g.score_theory || 0}</TableCell>
                                                            <TableCell className="text-center text-sm">{g.score_practice || 0}</TableCell>
                                                        </>
                                                    )}
                                                    <TableCell className="text-center">
                                                        <Badge className={`${getGradeColor(g.score_total)} border-none font-bold`}>
                                                            {g.score_total || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-xs">{g.semester}</TableCell>
                                                    <TableCell className="text-xs">{g.academic_year}</TableCell>
                                                    <TableCell className="text-right">
                                                        {activeProgram === 'Tahfidz' ? (
                                                            <TahfidzGradeDialog santriList={santriList || []} grade={g} />
                                                        ) : (
                                                            <GradeDialog santriList={santriList || []} grade={g} />
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={activeProgram === 'Diniyah' ? 8 : 6} className="h-24 text-center text-muted-foreground text-sm">
                                                    Tidak ada data nilai {activeProgram}.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-4 py-6 md:flex-row md:items-center md:justify-between">
                        <div className="flex flex-col gap-2 md:flex-row md:items-center">
                            <p className="text-xs md:text-sm text-muted-foreground text-center md:text-left">
                                Menampilkan <span className="font-medium text-slate-900">{grades?.length || 0}</span> dari <span className="font-medium text-slate-900">{count || 0}</span> data
                            </p>
                            <div className="flex justify-center md:ml-4">
                                <PaginationLimit currentLimit={limit} />
                            </div>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1} className="h-9 px-4 rounded-lg">
                                {page > 1 ? (
                                    <Link href={buildUrl({ page: page - 1 })} className="flex items-center">
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Sebelumnya
                                    </Link>
                                ) : (
                                    <span className="flex items-center">
                                        <ChevronLeft className="h-4 w-4 mr-1" />
                                        Sebelumnya
                                    </span>
                                )}
                            </Button>
                            <div className="bg-slate-100 px-3 py-1.5 rounded-lg text-xs font-medium">
                                {page} / {totalPages || 1}
                            </div>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages} className="h-9 px-4 rounded-lg">
                                {page < totalPages ? (
                                    <Link href={buildUrl({ page: page + 1 })} className="flex items-center">
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </Link>
                                ) : (
                                    <span className="flex items-center">
                                        Selanjutnya
                                        <ChevronRight className="h-4 w-4 ml-1" />
                                    </span>
                                )}
                            </Button>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="class" className="space-y-4">
                    <BulkInputFilter
                        classes={uniqueClasses}
                        subjects={activeProgram === 'Tahfidz' ? TAHFIDZ_SUBJECTS : DINIYAH_SUBJECTS}
                        years={ACADEMIC_YEARS}
                        semesters={SEMESTERS}
                        activeProgram={activeProgram}
                    />

                    <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                        <CardContent className="p-0 md:p-6">
                            {(shouldFetchInputData && batchSubject) ? (
                                <BulkGradeForm
                                    santriList={classSantri}
                                    existingGrades={classGrades}
                                    subject={batchSubject}
                                    semester={batchSemester}
                                    academicYear={batchYear === 'all' ? `${currentYear}/${currentYear + 1}` : batchYear}
                                    programType={activeProgram}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center p-12 text-center">
                                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                                    <h3 className="text-lg font-medium text-slate-900">Pilih Kelas & Mapel</h3>
                                    <p className="text-slate-500 max-w-sm mt-1">
                                        Silakan pilih {activeProgram === 'Diniyah' ? 'Kelas dan' : ''} Mata Pelajaran untuk mulai input nilai secara masal.
                                    </p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
