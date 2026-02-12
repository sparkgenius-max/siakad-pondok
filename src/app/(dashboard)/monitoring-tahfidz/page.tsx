import { createClient } from '@/lib/supabase/server'
import { TahfidzInput } from '@/components/tahfidz/tahfidz-input'
import { TahfidzChart } from '@/components/tahfidz/tahfidz-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, TrendingUp, History, Calendar } from 'lucide-react'

export default async function MonitoringTahfidzPage() {
    const supabase = await createClient()

    // Fetch Santri List
    const { data: santriList } = await supabase
        .from('santri')
        .select('id, name, nis')
        .eq('status', 'active')
        .order('name')

    // Fetch Recent Activity (Top 10)
    const { data: recentActivity } = await supabase
        .from('monitoring_tahfidz')
        .select('*, santri(name, nis, class)')
        .order('created_at', { ascending: false })
        .limit(10)

    // Fetch Stats for Chart (Aggregate by Date - simplified)
    // For a real app, we might want to sum up all pages per day or filter by a specific santri.
    // Here, I'll fetch the last 30 days of data and aggregate it client-side (or server-side here) for the chart.
    const today = new Date()
    const thirtyDaysAgo = new Date(today.setDate(today.getDate() - 30)).toISOString()

    const { data: chartDataRaw } = await supabase
        .from('monitoring_tahfidz')
        .select('date, ziyadah_pages, murojaah_juz')
        .gte('date', thirtyDaysAgo)
        .order('date', { ascending: true })

    // Aggregate data by date
    const chartDataMap = new Map()
    chartDataRaw?.forEach((item: any) => {
        const date = item.date
        if (!chartDataMap.has(date)) {
            chartDataMap.set(date, { date, ziyadah_pages: 0, murojaah_juz: 0, count: 0 })
        }
        const entry = chartDataMap.get(date)
        entry.ziyadah_pages += item.ziyadah_pages
        entry.murojaah_juz += item.murojaah_juz
        entry.count += 1
    })

    // Sort by date
    const chartData = Array.from(chartDataMap.values()).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

    // Calculate Totals
    const totalZiyadah = chartData.reduce((acc, curr) => acc + curr.ziyadah_pages, 0)
    const totalMurojaah = chartData.reduce((acc, curr) => acc + curr.murojaah_juz, 0)

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight text-emerald-800">Monitoring Tahfidz</h2>
            </div>

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Ziyadah (30 Hari)</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-700">{totalZiyadah} <span className="text-sm font-normal text-slate-500">Halaman</span></div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Murojaah (30 Hari)</CardTitle>
                        <BookOpen className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-700">{totalMurojaah} <span className="text-sm font-normal text-slate-500">Juz</span></div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-1 gap-4 lg:grid-cols-7">
                {/* Visualizations - Occupies more space */}
                <div className="col-span-1 lg:col-span-4 space-y-4">
                    <TahfidzChart data={chartData} />

                    {/* Recent Activity Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <History className="h-5 w-5 text-emerald-600" />
                                Riwayat Setoran Terakhir
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Santri</TableHead>
                                        <TableHead>Ziyadah</TableHead>
                                        <TableHead>Murojaah</TableHead>
                                        <TableHead className="text-right">Tanggal</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {recentActivity?.length ? (
                                        recentActivity.map((item: any) => (
                                            <TableRow key={item.id}>
                                                <TableCell className="font-medium">
                                                    <Link href={`/santri/${item.santri?.id}`} className="hover:underline text-emerald-950 font-semibold block">
                                                        {item.santri?.name}
                                                    </Link>
                                                    <div className="text-[10px] text-muted-foreground">{item.santri?.class}</div>
                                                </TableCell>
                                                <TableCell>
                                                    {item.ziyadah_pages > 0 ? (
                                                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                                            {item.ziyadah_pages} Hal
                                                        </Badge>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    {item.murojaah_juz > 0 ? (
                                                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                            {item.murojaah_juz} Juz
                                                        </Badge>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="text-right text-xs text-muted-foreground">
                                                    {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                                                Belum ada data setoran.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                {/* Input Form - Side Panel */}
                <div className="col-span-1 lg:col-span-3">
                    <TahfidzInput santriList={santriList || []} />
                </div>
            </div>
        </div>
    )
}
