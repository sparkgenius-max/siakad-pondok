import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { AttendanceForm } from '@/components/attendance/attendance-form'
import { AttendanceHistory } from '@/components/attendance/attendance-history'
import { AttendanceFilter } from '@/components/attendance/attendance-filter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CalendarIcon, Users, Clock, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ date?: string; class?: string; program?: string; tab?: string }>
}) {
    const params = await searchParams
    const activeTab = params.tab || 'input'
    const selectedDate = params.date || new Date().toISOString().split('T')[0]
    const selectedClass = params.class || ''
    const activeProgram = params.program === 'Tahfidz' ? 'Tahfidz' : 'Diniyah'
    const adminDb = createAdminClient()

    // Fetch Classes based on Program
    const { data: classesData } = await adminDb
        .from('santri')
        .select('class')
        .eq('status', 'active')
        .eq('program', activeProgram)

    // Sort classes naturally
    // Get Unique Classes and Sort them (Ula -> Wustha -> Ulya)
    const diniyahOrder = ['Ula', 'Wustha', 'Ulya']
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort((a, b) => {
        const indexA = diniyahOrder.indexOf(a)
        const indexB = diniyahOrder.indexOf(b)
        if (indexA !== -1 && indexB !== -1) return indexA - indexB
        if (indexA !== -1) return -1
        if (indexB !== -1) return 1
        return a.localeCompare(b)
    })

    // --- DATA FETCHING ---

    // 1. Input Tab Data
    let santriList: any[] = []
    let existingAttendance: any[] = []

    // Logic for fetching input data
    const shouldFetchInputData = activeTab === 'input' && (activeProgram === 'Tahfidz' || (activeProgram === 'Diniyah' && selectedClass))

    if (shouldFetchInputData) {
        let query = adminDb
            .from('santri')
            .select('id, name, nis, class')
            .eq('status', 'active')
            .eq('program', activeProgram)
            .order('name')

        if (activeProgram === 'Diniyah' && selectedClass) {
            query = query.eq('class', selectedClass)
        }

        const { data: santriData } = await query
        santriList = santriData || []

        if (santriList.length > 0) {
            const { data: attendanceData } = await adminDb
                .from('attendance')
                .select('*')
                .eq('date', selectedDate)
                .in('santri_id', santriList.map(s => s.id))
            existingAttendance = attendanceData || []
        }
    }

    // 2. History Tab Data
    let historyGroups: any[] = []

    if (activeTab === 'history') {
        // We need to fetch attendance records filtered by program (and class)
        // Since we can't easily join-filter in one go without inner join syntax that might conflict,
        // we'll fetch relevant santri IDs first, then fetch their attendance.

        let santriQuery = adminDb
            .from('santri')
            .select('id, name, nis, class') // Updated to include name, nis, class
            .eq('status', 'active')
            .eq('program', activeProgram)

        if (activeProgram === 'Diniyah' && selectedClass) {
            santriQuery = santriQuery.eq('class', selectedClass)
        }

        const { data: santriData } = await santriQuery
        const validSantriIds = santriData?.map(s => s.id) || []

        // Create lookup map for details
        const santriMap = new Map()
        santriData?.forEach(s => santriMap.set(s.id, s))

        if (validSantriIds.length > 0) {
            const { data: historyData } = await adminDb
                .from('attendance')
                .select('date, status, santri_id') // Added santri_id
                .in('santri_id', validSantriIds)
                .order('date', { ascending: false })

            // Aggregate in JS
            const groups: Record<string, any> = {}
            historyData?.forEach((record: any) => {
                const date = record.date
                if (!groups[date]) {
                    groups[date] = {
                        date,
                        present: 0,
                        sick: 0,
                        permission: 0,
                        alpha: 0,
                        total: 0,
                        details: [] // Added details array
                    }
                }
                groups[date].total++
                if (record.status === 'present') groups[date].present++
                else if (record.status === 'sick') groups[date].sick++
                else if (record.status === 'permission') groups[date].permission++
                else if (record.status === 'alpha') groups[date].alpha++

                // Add student detail
                const student = santriMap.get(record.santri_id)
                if (student) {
                    groups[date].details.push({
                        id: student.id,
                        name: student.name,
                        nis: student.nis,
                        className: student.class,
                        status: record.status
                    })
                }
            })

            historyGroups = Object.values(groups).sort((a: any, b: any) =>
                new Date(b.date).getTime() - new Date(a.date).getTime()
            )
        }
    }

    // 3. Overall Stats (Today's quick snapshot) - kept simple
    // We can just use zero stats if in history mode to save reads, or fetch global stats.
    // Let's keep it simple for now and only show relevant stats for the view or just hide them?
    // The previous code showed stats based on `existingAttendance` (which was for a specific date).
    // Let's keep that logic but only valid if we have `existingAttendance` loaded.
    const stats = {
        present: existingAttendance.filter(a => a.status === 'present').length,
        sick: existingAttendance.filter(a => a.status === 'sick').length,
        permission: existingAttendance.filter(a => a.status === 'permission').length,
        alpha: existingAttendance.filter(a => a.status === 'alpha').length,
    }

    const buildUrl = (newParams: Record<string, string>) => {
        const urlParams = new URLSearchParams()
        // Default params preservation
        if (params.date) urlParams.set('date', params.date)
        if (params.class) urlParams.set('class', params.class)
        if (params.program) urlParams.set('program', params.program)
        if (params.tab) urlParams.set('tab', params.tab)

        const merged = { ...Object.fromEntries(urlParams), ...newParams }

        // Ensure defaults
        if (!merged.program) merged.program = 'Diniyah'
        if (!merged.tab) merged.tab = 'input'

        const stringParams = new URLSearchParams(merged).toString()
        return `/attendance?${stringParams}`
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Presensi {activeProgram}</h2>
            </div>

            {/* Program Tabs */}
            <div className="flex space-x-2 border-b">
                <Link
                    href={buildUrl({ program: 'Diniyah', class: '' })}
                    className={`pb-2 px-4 text-sm font-medium transition-colors hover:text-emerald-600 ${activeProgram === 'Diniyah'
                        ? 'border-b-2 border-emerald-600 text-emerald-600'
                        : 'text-muted-foreground'
                        }`}
                >
                    Diniyah
                </Link>
                <Link
                    href={buildUrl({ program: 'Tahfidz', class: '' })}
                    className={`pb-2 px-4 text-sm font-medium transition-colors hover:text-cyan-600 ${activeProgram === 'Tahfidz'
                        ? 'border-b-2 border-cyan-600 text-cyan-600'
                        : 'text-muted-foreground'
                        }`}
                >
                    Tahfidz
                </Link>
            </div>

            {/* STATS CARDS - Only show if in Input mode and data is loaded, OR maybe aggregated stats?
                Let's show stats only for the Selected Date in Input Mode for clarity.
            */}
            {activeTab === 'input' && shouldFetchInputData && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Hadir</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.present}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Sakit/Izin</CardTitle>
                            <Clock className="h-4 w-4 text-yellow-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.sick + stats.permission}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Alpha</CardTitle>
                            <XCircle className="h-4 w-4 text-red-600" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.alpha}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Siswa</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{santriList.length}</div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <Tabs value={activeTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="input" asChild>
                        <Link href={buildUrl({ tab: 'input' })}>Input Absensi</Link>
                    </TabsTrigger>
                    <TabsTrigger value="history" asChild>
                        <Link href={buildUrl({ tab: 'history' })}>Riwayat Absensi</Link>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="input" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Filter Input</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AttendanceFilter
                                activeProgram={activeProgram}
                                activeTab="input"
                                uniqueClasses={uniqueClasses}
                                selectedClass={selectedClass}
                                selectedDate={selectedDate}
                            />
                        </CardContent>
                    </Card>

                    {shouldFetchInputData ? (
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    {activeProgram === 'Tahfidz'
                                        ? `Daftar Santri Tahfidz`
                                        : `Daftar Santri Kelas ${selectedClass}`}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AttendanceForm
                                    santriList={santriList}
                                    existingAttendance={existingAttendance}
                                    date={selectedDate}
                                    className={activeProgram === 'Tahfidz' ? 'Tahfidz' : selectedClass}
                                />
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed">
                            <Users className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                            <h3 className="text-lg font-medium text-slate-900">Pilih Kelas</h3>
                            <p className="text-slate-500 text-center max-w-sm mt-1">
                                Silakan pilih kelas dan tanggal untuk input absensi.
                            </p>
                            {uniqueClasses.length === 0 && (
                                <div className="mt-4 p-3 bg-yellow-50 text-yellow-800 text-sm rounded-md border border-yellow-200">
                                    <p className="font-semibold">Data Kelas Kosong?</p>
                                    <p>Pastikan data santri {activeProgram} memiliki kolom 'Kelas' yang terisi.</p>
                                </div>
                            )}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history" className="space-y-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle>Filter Riwayat</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AttendanceFilter
                                activeProgram={activeProgram}
                                activeTab="history"
                                uniqueClasses={uniqueClasses}
                                selectedClass={selectedClass}
                                selectedDate={selectedDate}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Riwayat Absensi {activeProgram} {selectedClass ? `- Kelas ${selectedClass}` : ''}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <AttendanceHistory
                                historyGroups={historyGroups}
                                activeProgram={activeProgram}
                                selectedClass={selectedClass}
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )

}
