import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MonitoringDialog } from '@/components/monitoring/monitoring-dialog'
import { BookOpen, Repeat } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function MonitoringPage() {
    const supabase = createAdminClient()

    // Fetch Lists
    const { data: santriList } = await supabase.from('santri')
        .select('id, name, nis, class')
        .eq('status', 'active')
        .eq('program', 'Tahfidz')
        .order('name')

    // Fetch Recent Monitoring Data (Last 50)
    const { data: monitoringLogs, error } = await supabase
        .from('monitoring_tahfidz')
        .select(`
            *,
            santri (id, name, nis)
        `)
        .order('date', { ascending: false })
        .limit(50)

    if (error) {
        console.error("Error fetching monitoring:", error)
    }

    const today = new Date().toISOString().split('T')[0]
    const { count: entriesToday } = await supabase
        .from('monitoring_tahfidz')
        .select('*', { count: 'exact', head: true })
        .eq('date', today)

    const { count: totalSantriTahfidz } = await supabase
        .from('santri')
        .select('*', { count: 'exact', head: true })
        .eq('program', 'Tahfidz')
        .eq('status', 'active')

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Monitoring Tahfidz</h2>
                <div className="flex items-center space-x-2">
                    <MonitoringDialog santriList={santriList || []} />
                </div>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-emerald-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Setoran Hari Ini
                        </CardTitle>
                        <BookOpen className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{entriesToday || 0}</div>
                        <p className="text-xs text-muted-foreground italic">
                            Santri yang sudah melakukan setoran hari ini
                        </p>
                    </CardContent>
                </Card>
                <Card className="border-l-4 border-l-blue-500 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Total Santri Tahfidz
                        </CardTitle>
                        <Repeat className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalSantriTahfidz || 0}</div>
                        <p className="text-xs text-muted-foreground italic">
                            Jumlah santri aktif di program Tahfidz
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="col-span-4 overflow-hidden">
                <CardHeader>
                    <CardTitle>Log Hafalan Terbaru</CardTitle>
                </CardHeader>
                <CardContent className="p-0 md:p-6">
                    <div className="space-y-4">
                        {monitoringLogs && monitoringLogs.length > 0 ? (
                            <>
                                {/* Mobile List */}
                                <div className="grid grid-cols-1 gap-4 md:hidden px-4 pb-4">
                                    {monitoringLogs.map((log: any) => (
                                        <div key={log.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <Link href={`/santri/${log.santri?.id}`} className="hover:underline">
                                                        <h4 className="font-bold text-slate-900">{log.santri?.name}</h4>
                                                    </Link>
                                                    <p className="text-[10px] text-muted-foreground font-mono">{log.santri?.nis}</p>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px]">
                                                    {new Date(log.date).toLocaleDateString("id-ID")}
                                                </Badge>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
                                                <div className="bg-emerald-50 p-2 rounded-lg">
                                                    <div className="text-[9px] text-emerald-600 uppercase font-bold">Ziyadah</div>
                                                    <div className="text-sm font-bold text-emerald-700">{log.ziyadah_pages} Hal</div>
                                                </div>
                                                <div className="bg-blue-50 p-2 rounded-lg">
                                                    <div className="text-[9px] text-blue-600 uppercase font-bold">Murojaah</div>
                                                    <div className="text-sm font-bold text-blue-700">{log.murojaah_juz} Juz</div>
                                                </div>
                                            </div>

                                            {log.notes && (
                                                <div className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded">
                                                    "{log.notes}"
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Desktop Table */}
                                <div className="hidden md:block relative overflow-x-auto">
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
                                                    <td className="px-6 py-4 text-xs">{new Date(log.date).toLocaleDateString("id-ID")}</td>
                                                    <td className="px-6 py-4 font-medium text-gray-900">
                                                        <Link href={`/santri/${log.santri?.id}`} className="hover:underline text-emerald-700">
                                                            {log.santri?.name}
                                                        </Link>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">{log.ziyadah_pages}</td>
                                                    <td className="px-6 py-4 text-center">{log.murojaah_juz}</td>
                                                    <td className="px-6 py-4 italic text-xs">{log.notes || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </>
                        ) : (
                            <div className="text-center text-muted-foreground py-12">
                                Belum ada data hafalan.
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
