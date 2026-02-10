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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar, CheckCircle, Users } from 'lucide-react'
import { AttendanceForm } from '@/components/attendance/attendance-form'

export default async function AttendancePage({
    searchParams,
}: {
    searchParams: Promise<{ class?: string; date?: string }>
}) {
    const params = await searchParams
    const supabase = await createClient()

    const today = new Date().toISOString().split('T')[0]
    const selectedClass = params.class || ''
    const selectedDate = params.date || today

    // Get unique classes
    const { data: classesData } = await supabase
        .from('santri')
        .select('class')
        .eq('status', 'active')
    const uniqueClasses = [...new Set(classesData?.map(s => s.class).filter(Boolean))].sort()

    // Get Santri and existing attendance
    let santriList: any[] = []
    let existingAttendance: any[] = []

    if (selectedClass) {
        const { data: santriData } = await supabase
            .from('santri')
            .select('id, name, nis')
            .eq('class', selectedClass)
            .eq('status', 'active')
            .order('name')
        santriList = santriData || []

        if (santriList.length > 0) {
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('*')
                .eq('date', selectedDate)
                .in('santri_id', santriList.map(s => s.id))
            existingAttendance = attendanceData || []
        }
    }

    return (
        <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Absensi Harian</h2>
                    <p className="text-sm md:text-base text-muted-foreground">Catat kehadiran santri per kelas per hari</p>
                </div>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Pilih Kelas dan Tanggal
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex items-center gap-4 flex-wrap">
                        <Select name="class" defaultValue={selectedClass}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Pilih Kelas" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueClasses.map(cls => (
                                    <SelectItem key={cls} value={cls}>Kelas {cls}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Input type="date" name="date" defaultValue={selectedDate} className="w-[160px]" />

                        <Button type="submit">Lihat Santri</Button>
                    </form>
                </CardContent>
            </Card>

            {selectedClass ? (
                santriList.length > 0 ? (
                    <AttendanceForm
                        santriList={santriList}
                        existingAttendance={existingAttendance}
                        date={selectedDate}
                        className={selectedClass}
                    />
                ) : (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <h3 className="text-lg font-medium">Tidak Ada Santri</h3>
                            <p className="text-muted-foreground">Tidak ada santri aktif di kelas {selectedClass}</p>
                        </CardContent>
                    </Card>
                )
            ) : (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium">Pilih Kelas</h3>
                        <p className="text-muted-foreground">Silakan pilih kelas dan tanggal untuk mulai absensi</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
