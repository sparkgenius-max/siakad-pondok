import { createClient } from '@/lib/supabase/server'
import { TahfidzGradeDialog } from '@/components/grades/tahfidz-grade-dialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
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

const SEMESTERS = [
    { value: 'Ganjil', label: 'Ganjil (Semester 1)' },
    { value: 'Genap', label: 'Genap (Semester 2)' },
]

const TAHFIDZ_SUBJECTS = [
    'KELANCARAN',
    'FASHOHAH',
    'TAJWID',
    'SAMBUNGAYAT',
    'TAKLIM KITAB SUBUH',
    "TAKLIM KITAB ISYA'",
]

export const dynamic = 'force-dynamic'

export default async function GradesTahfidzPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; tab?: string; class?: string; semester?: string; year?: string; limit?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = Number(params.limit) || 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    const activeTab = params.tab || 'all'

    const currentYear = new Date().getFullYear()
    const selectedYear = params.year || `${currentYear}/${currentYear + 1}`
    const selectedSemester = params.semester || 'Ganjil'
    const selectedClass = params.class || ''

    // Only fetch Tahfidz santri
    const { data: santriList } = await supabase
        .from('santri')
        .select('id, name, nis')
        .eq('status', 'active')
        .eq('program', 'Tahfidz')
        .order('name')

    const { data: classesData } = await supabase
        .from('santri')
        .select('class')
        .eq('status', 'active')
        .eq('program', 'Tahfidz')
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort()

    let query = supabase
        .from('grades')
        .select('*, santri(id, name, nis, class)', { count: 'exact' })
        .eq('program_type', 'Tahfidz')
        .order('created_at', { ascending: false })
        .range(from, to)

    if (params.q) {
        query = query.ilike('subject', `%${params.q}%`)
    }

    const { data: grades, count } = await query
    const totalPages = count ? Math.ceil(count / limit) : 0

    let classSantri: any[] = []
    let classGrades: any[] = []
    if (selectedClass) {
        const { data: santriData } = await supabase
            .from('santri')
            .select('id, name, nis, class')
            .eq('class', selectedClass)
            .eq('status', 'active')
            .eq('program', 'Tahfidz')
            .order('name')
        classSantri = santriData || []

        const santriIds = classSantri.map(s => s.id)
        if (santriIds.length > 0) {
            const { data: gradesData } = await supabase
                .from('grades')
                .select('*')
                .in('santri_id', santriIds)
                .eq('academic_year', selectedYear)
                .eq('semester', selectedSemester)
                .eq('program_type', 'Tahfidz')
            classGrades = gradesData || []
        }
    }

    const { count: totalGrades } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })
        .eq('program_type', 'Tahfidz')

    const buildUrl = (newParams: Record<string, string | number>) => {
        const urlParams = new URLSearchParams()
        const merged = { ...params, ...newParams }
        Object.entries(merged).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') urlParams.set(k, String(v))
        })
        return `/grades-tahfidz?${urlParams.toString()}`
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
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nilai Tahfidz</h2>
                <div className="flex items-center gap-2">
                    <Button variant="outline" asChild>
                        <Link href="/grades-tahfidz/batch">
                            <BookOpen className="mr-2 h-4 w-4" />
                            Input Batch
                        </Link>
                    </Button>
                    <TahfidzGradeDialog santriList={santriList || []} />
                </div>
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
                        <CardTitle className="text-xs md:text-sm font-medium">Santri Tahfidz</CardTitle>
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
                        <div className="text-xl md:text-2xl font-bold">{TAHFIDZ_SUBJECTS.length}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={activeTab} className="space-y-4">
                <TabsList className="grid grid-cols-2 w-full md:w-auto">
                    <TabsTrigger value="all" asChild>
                        <Link href={buildUrl({ tab: 'all', page: 1 })}>Semua Nilai</Link>
                    </TabsTrigger>
                    <TabsTrigger value="class" asChild>
                        <Link href={buildUrl({ tab: 'class' })}>Per Kelas</Link>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center">
                        <form className="flex items-center space-x-2 w-full md:w-auto">
                            <input type="hidden" name="tab" value="all" />
                            <div className="relative flex-1 md:w-[300px]">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="q"
                                    type="search"
                                    placeholder="Cari mata pelajaran..."
                                    className="pl-8"
                                    defaultValue={params.q}
                                />
                            </div>
                            <Button type="submit" variant="secondary">Cari</Button>
                        </form>
                    </div>

                    <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                        <CardContent className="p-0">
                            {/* Mobile Card List */}
                            <div className="grid grid-cols-1 gap-3 md:hidden">
                                {grades?.length ? (
                                    grades.map((g: any) => (
                                        <div key={g.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-bold text-slate-900">{g.santri?.name}</h4>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1 rounded">{g.santri?.nis}</span>
                                                        <span className="text-[10px] text-muted-foreground">Kelas {g.santri?.class}</span>
                                                    </div>
                                                </div>
                                                <Badge className={`${getGradeColor(g.score_total)} border-none text-sm font-bold h-8 w-8 flex items-center justify-center rounded-full px-0`}>
                                                    {g.score_total || 0}
                                                </Badge>
                                            </div>

                                            <div className="flex justify-between items-end pt-2 border-t border-slate-50">
                                                <div className="text-xs space-y-1">
                                                    <p className="font-bold text-slate-800">{g.subject}</p>
                                                    <div className="flex gap-3 text-[10px] text-muted-foreground">
                                                        <span>{g.semester} • {g.academic_year}</span>
                                                    </div>
                                                </div>
                                                <TahfidzGradeDialog santriList={santriList || []} grade={g} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-12 bg-white rounded-xl border">
                                        <p className="text-muted-foreground">Tidak ada data nilai.</p>
                                    </div>
                                )}
                            </div>

                            {/* Desktop Table */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader className="bg-slate-50">
                                        <TableRow>
                                            <TableHead>Santri</TableHead>
                                            <TableHead>Kelas</TableHead>
                                            <TableHead>Mapel</TableHead>
                                            <TableHead className="text-center">Nilai</TableHead>
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
                                                        <div className="font-semibold text-slate-900">{g.santri?.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono">{g.santri?.nis}</div>
                                                    </TableCell>
                                                    <TableCell className="text-sm">Kelas {g.santri?.class}</TableCell>
                                                    <TableCell className="whitespace-nowrap font-medium text-slate-800">{g.subject}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge className={`${getGradeColor(g.score_total)} border-none font-bold`}>
                                                            {g.score_total || 0}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>{g.semester}</TableCell>
                                                    <TableCell>{g.academic_year}</TableCell>
                                                    <TableCell className="text-right">
                                                        <TahfidzGradeDialog santriList={santriList || []} grade={g} />
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground text-sm">
                                                    Tidak ada data nilai.
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
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Filter Kelas</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form className="flex items-center gap-3 flex-wrap">
                                <input type="hidden" name="tab" value="class" />
                                <Select name="class" defaultValue={selectedClass}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueClasses.map(cls => (
                                            <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>
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
                                <Select name="semester" defaultValue={selectedSemester}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Semester" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {SEMESTERS.map(s => (
                                            <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button type="submit">Filter</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {selectedClass && (
                        <Card className="overflow-hidden border-none md:border md:border-border bg-transparent md:bg-white shadow-none md:shadow-sm">
                            <CardContent className="p-0">
                                {/* Mobile Card List */}
                                <div className="grid grid-cols-1 gap-3 md:hidden">
                                    {classSantri.length > 0 ? classSantri.map((santri) => {
                                        const santriGrades = classGrades.filter(g => g.santri_id === santri.id)
                                        const gradeCount = santriGrades.length
                                        const avgGrade = gradeCount > 0
                                            ? Math.round(santriGrades.reduce((sum, g) => sum + (parseFloat(g.score_total) || 0), 0) / gradeCount)
                                            : null

                                        return (
                                            <div key={santri.id} className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
                                                <div className="flex justify-between items-start">
                                                    <div className="space-y-1">
                                                        <h4 className="font-bold text-slate-900">{santri.name}</h4>
                                                        <span className="text-[10px] text-muted-foreground font-mono bg-slate-100 px-1 rounded">{santri.nis}</span>
                                                    </div>
                                                    {avgGrade !== null ? (
                                                        <div className="text-right">
                                                            <div className="text-[10px] text-muted-foreground mb-1">Rata-rata</div>
                                                            <Badge className={`${getGradeColor(String(avgGrade))} border-none h-8 w-8 flex items-center justify-center rounded-full px-0 font-bold`}>
                                                                {avgGrade}
                                                            </Badge>
                                                        </div>
                                                    ) : (
                                                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-slate-200">Belum ada nilai</Badge>
                                                    )}
                                                </div>

                                                <div className="flex justify-between items-center pt-2 border-t border-slate-50">
                                                    <div className="text-xs text-muted-foreground">
                                                        <span className="font-bold text-slate-700">{gradeCount}</span> /{' '}{TAHFIDZ_SUBJECTS.length} Mapel
                                                    </div>
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs" asChild>
                                                        <Link href={`/santri/${santri.id}`}>Detail</Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    }) : (
                                        <div className="text-center py-12 bg-white rounded-xl border">
                                            <p className="text-muted-foreground">Tidak ada santri Tahfidz di kelas ini.</p>
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Table View */}
                                <div className="hidden md:block">
                                    <Table>
                                        <TableHeader className="bg-slate-50">
                                            <TableRow>
                                                <TableHead className="w-[50px]">No</TableHead>
                                                <TableHead>Nama Santri</TableHead>
                                                <TableHead className="text-center">Mapel Terinput</TableHead>
                                                <TableHead className="text-center">Rata-rata</TableHead>
                                                <TableHead className="text-right">Aksi</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {classSantri.length > 0 ? classSantri.map((santri, index) => {
                                                const santriGrades = classGrades.filter(g => g.santri_id === santri.id)
                                                const gradeCount = santriGrades.length
                                                const avgGrade = gradeCount > 0
                                                    ? Math.round(santriGrades.reduce((sum, g) => sum + (parseFloat(g.score_total) || 0), 0) / gradeCount)
                                                    : null

                                                return (
                                                    <TableRow key={santri.id}>
                                                        <TableCell className="text-muted-foreground text-xs">{index + 1}</TableCell>
                                                        <TableCell>
                                                            <div className="font-semibold text-slate-900">{santri.name}</div>
                                                            <div className="text-[10px] text-muted-foreground font-mono">{santri.nis}</div>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            <Badge variant="secondary" className="bg-slate-100 text-slate-700 hover:bg-slate-100">{gradeCount}/{TAHFIDZ_SUBJECTS.length}</Badge>
                                                        </TableCell>
                                                        <TableCell className="text-center">
                                                            {avgGrade !== null ? (
                                                                <Badge className={`${getGradeColor(String(avgGrade))} border-none font-bold`}>
                                                                    {avgGrade}
                                                                </Badge>
                                                            ) : (
                                                                <span className="text-muted-foreground text-xs">-</span>
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm" asChild>
                                                                <Link href={`/santri/${santri.id}`}>Detail</Link>
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                )
                                            }) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                                        Tidak ada santri Tahfidz di kelas ini.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
