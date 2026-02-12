'use client'

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TahfidzChartProps {
    data: any[]
}

export function TahfidzChart({ data }: TahfidzChartProps) {
    return (
        <Card className="col-span-4">
            <CardHeader>
                <CardTitle>Grafik Perkembangan Hafalan</CardTitle>
                <CardDescription>
                    Statistik Ziyadah dan Murojaah 30 hari terakhir.
                </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
                <Tabs defaultValue="ziyadah">
                    <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="ziyadah">Ziyadah</TabsTrigger>
                        <TabsTrigger value="murojaah">Murojaah</TabsTrigger>
                    </TabsList>
                    <TabsContent value="ziyadah">
                        <ResponsiveContainer width="100%" height={350}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: any) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: any) => `${value} Hal`}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    labelFormatter={(label: any) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="ziyadah_pages"
                                    stroke="#059669"
                                    strokeWidth={3}
                                    activeDot={{ r: 8 }}
                                    name="Halaman"
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </TabsContent>
                    <TabsContent value="murojaah">
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: any) => new Date(value).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                />
                                <YAxis
                                    stroke="#888888"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(value: any) => `${value} Juz`}
                                />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                                    labelFormatter={(label: any) => new Date(label).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                />
                                <Bar dataKey="murojaah_juz" fill="#0284c7" radius={[4, 4, 0, 0]} name="Juz" />
                            </BarChart>
                        </ResponsiveContainer>
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
    )
}
