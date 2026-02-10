'use client'

import { useState } from 'react'
import { Calendar } from '@/components/ui/calendar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import { Calendar as CalendarIcon, Clock, Trash2, Tag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteEvent } from '@/app/(dashboard)/calendar/actions'
import { toast } from 'sonner'
import { CalendarEventDialog } from '@/components/calendar/calendar-event-dialog'

interface CalendarEvent {
    id: string
    title: string
    description?: string
    start_date: string
    end_date: string
    category: string
}

interface CalendarViewProps {
    events: CalendarEvent[]
}

const categoryColors: Record<string, string> = {
    holiday: 'bg-red-100 text-red-700 border-red-200',
    exam: 'bg-orange-100 text-orange-700 border-orange-200',
    activity: 'bg-blue-100 text-blue-700 border-blue-200',
    meeting: 'bg-purple-100 text-purple-700 border-purple-200',
    other: 'bg-gray-100 text-gray-700 border-gray-200',
}

const categoryLabels: Record<string, string> = {
    holiday: 'Libur',
    exam: 'Ujian',
    activity: 'Kegiatan',
    meeting: 'Rapat',
    other: 'Lainnya',
}

export function CalendarView({ events }: CalendarViewProps) {
    const [date, setDate] = useState<Date | undefined>(new Date())

    // Events for calendar dots
    const eventDates = events.map(e => new Date(e.start_date))

    // Filter events for selected date
    const selectedEvents = events.filter(e => {
        if (!date) return false
        const checkDate = new Date(date)
        checkDate.setHours(0, 0, 0, 0)

        const start = new Date(e.start_date)
        start.setHours(0, 0, 0, 0)

        const end = new Date(e.end_date)
        end.setHours(0, 0, 0, 0)

        return checkDate >= start && checkDate <= end
    })

    const handleDelete = async (id: string) => {
        if (confirm('Hapus agenda ini?')) {
            const res = await deleteEvent(id)
            if (res?.error) {
                toast.error(res.error)
            } else {
                toast.success('Agenda dihapus')
            }
        }
    }

    return (
        <div className="grid gap-6 md:grid-cols-[1fr_350px] lg:grid-cols-[1fr_400px]">
            {/* Left: Calendar & Upcoming */}
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Kalender</CardTitle>
                    </CardHeader>
                    <CardContent className="flex justify-center p-0 pb-4">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            className="rounded-md border shadow-sm"
                            modifiers={{
                                hasEvent: eventDates
                            }}
                            modifiersClassNames={{
                                hasEvent: 'font-bold text-blue-600 underline decoration-blue-500/50'
                            }}
                        />
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Agenda Mendatang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-4">
                                {events
                                    .filter(e => new Date(e.start_date) >= new Date())
                                    .slice(0, 5)
                                    .map(event => (
                                        <div key={event.id} className="flex items-start justify-between border-b pb-4 last:border-0 last:pb-0">
                                            <div className="space-y-1">
                                                <p className="font-medium text-sm">{event.title}</p>
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <CalendarIcon className="mr-1 h-3 w-3" />
                                                    {format(new Date(event.start_date), 'dd MMM yyyy', { locale: id })}
                                                </div>
                                                <Badge variant="outline" className={`text-[10px] px-1 py-0 ${categoryColors[event.category]}`}>
                                                    {categoryLabels[event.category]}
                                                </Badge>
                                            </div>
                                        </div>
                                    ))}
                                {events.filter(e => new Date(e.start_date) >= new Date()).length === 0 && (
                                    <p className="text-sm text-muted-foreground text-center py-4">Tidak ada agenda mendatang</p>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                </Card>
            </div>

            {/* Right: Selected Date Details */}
            <div className="space-y-6">
                <Card className="h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b">
                        <div className="space-y-1">
                            <CardTitle className="text-xl">
                                {date ? format(date, 'd MMMM yyyy', { locale: id }) : 'Pilih Tanggal'}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground">
                                {selectedEvents.length} agenda hari ini
                            </p>
                        </div>
                        {date && (
                            <CalendarEventDialog
                                defaultDate={date}
                                trigger={
                                    <Button size="sm" variant="outline">
                                        <CalendarIcon className="h-4 w-4 mr-2" />
                                        Tambah
                                    </Button>
                                }
                            />
                        )}
                    </CardHeader>
                    <CardContent className="pt-6 flex-1">
                        {date ? (
                            selectedEvents.length > 0 ? (
                                <div className="space-y-4">
                                    {selectedEvents.map(event => (
                                        <Card key={event.id} className="overflow-hidden border-l-4 border-l-blue-500 shadow-sm transition-all hover:shadow-md">
                                            <CardContent className="p-4 space-y-3">
                                                <div className="flex items-start justify-between">
                                                    <h4 className="font-semibold text-base">{event.title}</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-6 w-6 text-red-400 hover:text-red-700 hover:bg-red-50 -mr-2 -mt-2"
                                                        onClick={() => handleDelete(event.id)}
                                                    >
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>

                                                {event.description && (
                                                    <p className="text-sm text-muted-foreground line-clamp-3">
                                                        {event.description}
                                                    </p>
                                                )}

                                                <div className="flex flex-wrap items-center gap-2 pt-1 border-t mt-2">
                                                    <Badge variant="outline" className={`${categoryColors[event.category]} border-0`}>
                                                        {categoryLabels[event.category]}
                                                    </Badge>
                                                    <span className="text-xs text-muted-foreground flex items-center bg-gray-50 px-2 py-1 rounded">
                                                        <Clock className="h-3 w-3 mr-1" />
                                                        {format(new Date(event.start_date), 'HH:mm')} - {format(new Date(event.end_date), 'HH:mm')}
                                                    </span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-[300px] text-muted-foreground space-y-4">
                                    <div className="bg-gray-50 p-6 rounded-full">
                                        <CalendarIcon className="h-12 w-12 opacity-20" />
                                    </div>
                                    <div className="text-center">
                                        <p className="font-medium">Tidak ada agenda</p>
                                        <p className="text-sm">Klik tombol Tambah untuk membuat agenda baru</p>
                                    </div>
                                    <CalendarEventDialog
                                        defaultDate={date}
                                        trigger={
                                            <Button variant="outline" className="mt-4">
                                                Buat Agenda Baru
                                            </Button>
                                        }
                                    />
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <p>Pilih tanggal di kalender</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
