import { createClient } from '@/lib/supabase/server'
import { GradeDialog } from '@/components/grades/grade-dialog'
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

const SEMESTERS = [
    { value: 'Ganjil', label: 'Ganjil (Semester 1)' },
    { value: 'Genap', label: 'Genap (Semester 2)' },
]

// Contoh mata pelajaran pondok pesantren
const SUBJECTS = [
    'Al-Quran', 'Tajwid', 'Tafsir', 'Hadits', 'Fiqih', 'Ushul Fiqih',
    'Aqidah', 'Akhlaq', 'Nahwu', 'Shorof', 'Balaghah', 'Muthalaah',
    'Imla', 'Insya', 'Mahfudzat', 'Tarikh Islam', 'Bahasa Arab',
    'Bahasa Indonesia', 'Bahasa Inggris', 'Matematika', 'IPA', 'IPS'
]

export default async function GradesPage({
    searchParams,
}: {
    searchParams: Promise<{ page?: string; q?: string; tab?: string; class?: string; semester?: string; year?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()
    const page = Number(params.page) || 1
    const limit = 20
    const from = (page - 1) * limit
    const to = from + limit - 1
    const activeTab = params.tab || 'all'

    const currentYear = new Date().getFullYear()
    const selectedYear = params.year || `${currentYear}/${currentYear + 1}`
    const selectedSemester = params.semester || 'Ganjil'
    const selectedClass = params.class || ''

    // Fetch santri list for dialog
    const { data: santriList } = await supabase
        .from('santri')
        .select('id, name, nis')
        .eq('status', 'active')
        .order('name')

    // Get unique classes
    const { data: classesData } = await supabase
        .from('santri')
        .select('class')
        .eq('status', 'active')
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort()

    // Build query for all grades
    let query = supabase
        .from('grades')
        .select('*, santri(id, name, nis, class)', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

    if (params.q) {
        query = query.ilike('subject', `%${params.q}%`)
    }

    const { data: grades, count } = await query
    const totalPages = count ? Math.ceil(count / limit) : 0

    // Data for per-class input
    let classSantri: any[] = []
    let classGrades: any[] = []
    if (selectedClass) {
        const { data: santriData } = await supabase
            .from('santri')
            .select('id, name, nis, class')
            .eq('class', selectedClass)
            .eq('status', 'active')
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
            classGrades = gradesData || []
        }
    }

    // Stats
    const { count: totalGrades } = await supabase
        .from('grades')
        .select('*', { count: 'exact', head: true })

    const { count: totalSubjects } = await supabase
        .from('grades')
        .select('subject', { count: 'exact', head: true })

    // Build URL helper
    const buildUrl = (newParams: Record<string, string | number>) => {
        const urlParams = new URLSearchParams()
        const merged = { ...params, ...newParams }
        Object.entries(merged).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') urlParams.set(k, String(v))
        })
        return `/grades?${urlParams.toString()}`
    }

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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Nilai Akademik</h2>
                <GradeDialog santriList={santriList || []} />
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Nilai</CardTitle>
                        <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalGrades || 0}</div>
                        <p className="text-xs text-muted-foreground">data nilai tercatat</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Santri Aktif</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{santriList?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">santri terdaftar</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Kelas</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{uniqueClasses.length}</div>
                        <p className="text-xs text-muted-foreground">kelas aktif</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Mata Pelajaran</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{SUBJECTS.length}</div>
                        <p className="text-xs text-muted-foreground">mapel tersedia</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue={activeTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="all" asChild>
                        <Link href={buildUrl({ tab: 'all', page: 1 })}>Semua Nilai</Link>
                    </TabsTrigger>
                    <TabsTrigger value="class" asChild>
                        <Link href={buildUrl({ tab: 'class' })}>Input Per Kelas</Link>
                    </TabsTrigger>
                </TabsList>

                {/* SEMUA NILAI TAB */}
                <TabsContent value="all" className="space-y-4">
                    <div className="flex items-center gap-4">
                        <form className="flex items-center space-x-2">
                            <input type="hidden" name="tab" value="all" />
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    name="q"
                                    type="search"
                                    placeholder="Cari mata pelajaran..."
                                    className="pl-8 w-[250px]"
                                    defaultValue={params.q}
                                />
                            </div>
                            <Button type="submit" variant="secondary">Cari</Button>
                        </form>
                    </div>

                    <Card>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Santri</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Tahun Ajaran</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Mata Pelajaran</TableHead>
                                        <TableHead className="text-center">Nilai</TableHead>
                                        <TableHead className="text-right">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {grades?.length ? (
                                        grades.map((g: any) => (
                                            <TableRow key={g.id}>
                                                <TableCell>
                                                    <Link href={`/grades/santri/${g.santri?.id}`} className="hover:underline">
                                                        <div className="font-medium">{g.santri?.name}</div>
                                                        <div className="text-xs text-muted-foreground">{g.santri?.nis}</div>
                                                    </Link>
                                                </TableCell>
                                                <TableCell>{g.santri?.class}</TableCell>
                                                <TableCell>{g.academic_year}</TableCell>
                                                <TableCell>{g.semester}</TableCell>
                                                <TableCell>{g.subject}</TableCell>
                                                <TableCell className="text-center">
                                                    <Badge className={`${getGradeColor(g.grade)} font-bold`}>
                                                        {g.grade}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <GradeDialog santriList={santriList || []} grade={g} />
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={7} className="h-24 text-center">
                                                Belum ada data nilai.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>

                    {/* Pagination */}
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan {grades?.length || 0} dari {count || 0} data
                        </div>
                        <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" disabled={page <= 1} asChild={page > 1}>
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
                            <div className="text-sm">Halaman {page} dari {totalPages || 1}</div>
                            <Button variant="outline" size="sm" disabled={page >= totalPages} asChild={page < totalPages}>
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

                {/* INPUT PER KELAS TAB */}
                <TabsContent value="class" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Pilih Kelas dan Periode</CardTitle>
                            <CardDescription>Pilih kelas untuk melihat dan input nilai santri</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="flex items-center gap-4 flex-wrap">
                                <input type="hidden" name="tab" value="class" />
                                <Select name="class" defaultValue={selectedClass}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Pilih Kelas" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {uniqueClasses.map(cls => (
                                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select name="year" defaultValue={selectedYear}>
                                    <SelectTrigger className="w-[150px]">
                                        <SelectValue placeholder="Tahun Ajaran" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {[`${currentYear}/${currentYear + 1}`, `${currentYear - 1}/${currentYear}`].map(y => (
                                            <SelectItem key={y} value={y}>{y}</SelectItem>
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
                                <Button type="submit">Tampilkan</Button>
                            </form>
                        </CardContent>
                    </Card>

                    {selectedClass && classSantri.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Kelas {selectedClass} - {selectedSemester} {selectedYear}</CardTitle>
                                <CardDescription>{classSantri.length} santri terdaftar</CardDescription>
                            </CardHeader>
                            <CardContent className="p-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="w-[50px]">No</TableHead>
                                            <TableHead>NIS</TableHead>
                                            <TableHead>Nama Santri</TableHead>
                                            <TableHead className="text-center">Jumlah Nilai</TableHead>
                                            <TableHead className="text-center">Rata-rata</TableHead>
                                            <TableHead className="text-right">Aksi</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {classSantri.map((santri: any, index: number) => {
                                            const santriGrades = classGrades.filter(g => g.santri_id === santri.id)
                                            const gradeCount = santriGrades.length
                                            const avgGrade = gradeCount > 0
                                                ? Math.round(santriGrades.reduce((sum, g) => sum + (parseInt(g.grade) || 0), 0) / gradeCount)
                                                : null

                                            return (
                                                <TableRow key={santri.id}>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell className="font-mono">{santri.nis}</TableCell>
                                                    <TableCell className="font-medium">{santri.name}</TableCell>
                                                    <TableCell className="text-center">
                                                        <Badge variant={gradeCount > 0 ? 'default' : 'secondary'}>
                                                            {gradeCount} mapel
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {avgGrade !== null ? (
                                                            <Badge className={getGradeColor(String(avgGrade))}>
                                                                {avgGrade}
                                                            </Badge>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-right space-x-2">
                                                        <Button variant="outline" size="sm" asChild>
                                                            <Link href={`/grades/santri/${santri.id}`}>
                                                                Lihat Nilai
                                                            </Link>
                                                        </Button>
                                                        <GradeDialog santriList={[santri]} />
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })}
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                    )}

                    {selectedClass && classSantri.length === 0 && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Tidak Ada Santri</h3>
                                <p className="text-muted-foreground">Tidak ada santri aktif di kelas {selectedClass}</p>
                            </CardContent>
                        </Card>
                    )}

                    {!selectedClass && (
                        <Card>
                            <CardContent className="py-12 text-center">
                                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                <h3 className="text-lg font-medium">Pilih Kelas</h3>
                                <p className="text-muted-foreground">Silakan pilih kelas untuk melihat daftar santri</p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    )
}
