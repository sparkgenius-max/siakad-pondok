import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Plus } from 'lucide-react'
import { CalendarView } from '@/components/calendar/calendar-view'
import { CalendarEventDialog } from '@/components/calendar/calendar-event-dialog'

export default async function CalendarPage() {
    const supabase = await createClient()

    // Fetch ALL events (simple implementation)
    // To scale, filter by month range based on searchParams
    const { data: events } = await supabase
        .from('academic_calendar')
        .select('*')
        .order('start_date', { ascending: true })

    return (
        <div className="flex-1 space-y-6 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Kalender Akademik</h2>
                    <p className="text-muted-foreground">Jadwal kegiatan, ujian, dan libur pondok</p>
                </div>
                <CalendarEventDialog />
            </div>

            <CalendarView events={events || []} />
        </div>
    )
}
