'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface CalendarEvent {
    title: string
    description?: string
    start_date: string
    end_date: string
    category: 'holiday' | 'exam' | 'activity' | 'meeting' | 'other'
}

export async function createEvent(prevState: any, formData: FormData) {
    const supabase = await createClient()

    // Parse Date (from input type=date) and TIME (from input type=time)
    const startDate = formData.get('start_date') as string
    const startTime = (formData.get('start_time') as string) || '00:00'
    const endDate = (formData.get('end_date') as string) || startDate
    const endTime = (formData.get('end_time') as string) || '23:59'

    // Combine Date & Time
    const startDateTime = new Date(`${startDate}T${startTime}`).toISOString()
    const endDateTime = new Date(`${endDate}T${endTime}`).toISOString()

    const data: any = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        start_date: startDateTime,
        end_date: endDateTime,
        category: formData.get('category') as string,
        created_by: (await supabase.auth.getUser()).data.user?.id,
    }

    const { error } = await supabase.from('academic_calendar').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/calendar')
    return { message: 'Agenda berhasil ditambahkan' }
}

export async function deleteEvent(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('academic_calendar').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/calendar')
}
