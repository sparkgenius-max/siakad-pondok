'use client'

import { useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { ScrollArea } from "@/components/ui/scroll-area"
import Link from 'next/link'
import { Eye, Pencil } from 'lucide-react'

// Helper to format date in Indonesian
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })
}

interface AttendanceDetail {
    id: string
    name: string
    nis: string
    status: 'present' | 'sick' | 'permission' | 'alpha'
    className?: string
}

interface HistoryGroup {
    date: string
    present: number
    sick: number
    permission: number
    alpha: number
    total: number
    details: AttendanceDetail[]
}

interface AttendanceHistoryProps {
    historyGroups: HistoryGroup[]
    activeProgram: string
    selectedClass: string
}

export function AttendanceHistory({ historyGroups, activeProgram, selectedClass }: AttendanceHistoryProps) {
    const [selectedGroup, setSelectedGroup] = useState<HistoryGroup | null>(null)

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'present': return <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">Hadir</Badge>
            case 'sick': return <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-none">Sakit</Badge>
            case 'permission': return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none">Izin</Badge>
            case 'alpha': return <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none">Alpha</Badge>
            default: return <span className="text-muted-foreground">-</span>
        }
    }

    const buildEditUrl = (date: string) => {
        const params = new URLSearchParams()
        params.set('tab', 'input')
        params.set('program', activeProgram)
        if (selectedClass) params.set('class', selectedClass)
        params.set('date', date)
        return `/attendance?${params.toString()}`
    }

    return (
        <>
            {/* Mobile View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
                {historyGroups.length > 0 ? (
                    historyGroups.map((group) => (
                        <div key={group.date} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-900">{formatDate(group.date)}</h4>
                                <Badge className="bg-slate-100 text-slate-700 border-none font-bold">
                                    Total: {group.total}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center">
                                <div className="bg-green-50 p-2 rounded-lg">
                                    <div className="text-[10px] text-green-600 uppercase font-bold">Hadir</div>
                                    <div className="text-lg font-bold text-green-700">{group.present}</div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded-lg">
                                    <div className="text-[10px] text-yellow-600 uppercase font-bold">Sakit</div>
                                    <div className="text-lg font-bold text-yellow-700">{group.sick}</div>
                                </div>
                                <div className="bg-blue-50 p-2 rounded-lg">
                                    <div className="text-[10px] text-blue-600 uppercase font-bold">Izin</div>
                                    <div className="text-lg font-bold text-blue-700">{group.permission}</div>
                                </div>
                                <div className="bg-red-50 p-2 rounded-lg">
                                    <div className="text-[10px] text-red-600 uppercase font-bold">Alpha</div>
                                    <div className="text-lg font-bold text-red-700">{group.alpha}</div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-50">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => setSelectedGroup(group)}
                                >
                                    <Eye className="h-4 w-4 mr-1" />
                                    Detail
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1" asChild>
                                    <Link href={buildEditUrl(group.date)}>
                                        <Pencil className="h-4 w-4 mr-1" />
                                        Edit
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed text-muted-foreground">
                        Belum ada data absensi.
                    </div>
                )}
            </div>

            <div className="hidden md:block rounded-md border">
                <Table>
                    <TableHeader className="bg-slate-50">
                        <TableRow>
                            <TableHead className="w-[180px]">Tanggal</TableHead>
                            <TableHead className="text-center">Hadir</TableHead>
                            <TableHead className="text-center">Sakit</TableHead>
                            <TableHead className="text-center">Izin</TableHead>
                            <TableHead className="text-center">Alfa</TableHead>
                            <TableHead className="text-center">Total</TableHead>
                            <TableHead className="text-right">Aksi</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {historyGroups.length > 0 ? (
                            historyGroups.map((group) => (
                                <TableRow key={group.date} className="hover:bg-slate-50">
                                    <TableCell className="font-medium whitespace-nowrap">
                                        {formatDate(group.date)}
                                    </TableCell>
                                    <TableCell className="text-center text-green-600 font-bold">{group.present}</TableCell>
                                    <TableCell className="text-center text-yellow-600 font-bold">{group.sick}</TableCell>
                                    <TableCell className="text-center text-blue-600 font-bold">{group.permission}</TableCell>
                                    <TableCell className="text-center text-red-600 font-bold">{group.alpha}</TableCell>
                                    <TableCell className="text-center text-slate-900 font-bold">{group.total}</TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="secondary"
                                                size="sm"
                                                onClick={() => setSelectedGroup(group)}
                                            >
                                                <Eye className="h-4 w-4 mr-1" />
                                                Detail
                                            </Button>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={buildEditUrl(group.date)}>
                                                    <Pencil className="h-4 w-4 mr-1" />
                                                    Edit
                                                </Link>
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                                    Belum ada data absensi.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedGroup} onOpenChange={(open) => !open && setSelectedGroup(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col p-6">
                    <DialogHeader>
                        <DialogTitle>Detail Absensi</DialogTitle>
                        <DialogDescription>
                            {selectedGroup && formatDate(selectedGroup.date)}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden -mx-6 px-6">
                        <ScrollArea className="h-[60vh] pr-4">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white z-10 shadow-sm">
                                    <TableRow>
                                        <TableHead>Nama Santri</TableHead>
                                        <TableHead>Kelas</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {selectedGroup?.details.map((detail) => (
                                        <TableRow key={detail.id}>
                                            <TableCell>
                                                <Link href={`/santri/${detail.id}`} className="hover:underline cursor-pointer" target="_blank">
                                                    <div className="font-medium text-slate-900">{detail.name || 'Unknown'}</div>
                                                </Link>
                                                <div className="text-xs text-muted-foreground font-mono">{detail.nis}</div>
                                            </TableCell>
                                            <TableCell className="text-sm">{detail.className || '-'}</TableCell>
                                            <TableCell>{getStatusLabel(detail.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </ScrollArea>
                    </div>

                    <div className="flex justify-end pt-4 border-t mt-4">
                        <Button variant="outline" onClick={() => setSelectedGroup(null)}>Tutup</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
