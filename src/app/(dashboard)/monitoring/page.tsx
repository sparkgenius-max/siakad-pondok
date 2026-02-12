import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MonitoringDialog } from '@/components/monitoring/monitoring-dialog'
import { BookOpen, Repeat } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function MonitoringPage() {
    const supabase = createAdminClient()

    // Fetch Lists
    const { data: santriList } = await supabase.from('santri').select('id, name, nis, class').eq('status', 'active').order('name')

    // Fetch Recent Monitoring Data (Last 50)
    const { data: monitoringLogs, error } = await supabase
        .from('monitoring_tahfidz')
        .select(`
            *,
            santri (name, nis)
        `)
        .order('date', { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error fetching monitoring:", error)
    }

    // Simple Stats
    const totalZiyadah = monitoringLogs?.reduce((acc, curr) => acc + (curr.ziyadah_pages || 0), 0) || 0
    const totalMurojaah = monitoringLogs?.reduce((acc, curr) => acc + (curr.murojaah_juz || 0), 0) || 0

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight text-primary">Monitoring Tahfidz</h2>
                <div className="flex items-center space-x-2">
                    <MonitoringDialog santriList={santriList || []} />
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Ziyadah (Halaman)
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalZiyadah}</div>
                        <p className="text-xs text-muted-foreground">
                            Dari 50 entri terakhir
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Murojaah (Juz)
                        </CardTitle>
                        <Repeat className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalMurojaah}</div>
                        <p className="text-xs text-muted-foreground">
                            Dari 50 entri terakhir
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4">
                <CardHeader>
                    <CardTitle>Log Hafalan Terbaru</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-8">
                        {monitoringLogs && monitoringLogs.length > 0 ? (
                            <div className="relative overflow-x-auto">
                                <table className="w-full text-sm text-left rtl:text-right text-gray-500">
                                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3">Tanggal</th>
                                            <th scope="col" className="px-6 py-3">Santri</th>
                                            <th scope="col" className="px-6 py-3">Ziyadah (Hal)</th>
                                            <th scope="col" className="px-6 py-3">Murojaah (Juz)</th>
                                            <th scope="col" className="px-6 py-3">Catatan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {monitoringLogs.map((log: any) => (
                                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                                <td className="px-6 py-4">{new Date(log.date).toLocaleDateString("id-ID")}</td>
                                                <td className="px-6 py-4 font-medium text-gray-900">{log.santri?.name}</td>
                                                <td className="px-6 py-4">{log.ziyadah_pages}</td>
                                                <td className="px-6 py-4">{log.murojaah_juz}</td>
                                                <td className="px-6 py-4">{log.notes || '-'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                Belum ada data hafalan.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
