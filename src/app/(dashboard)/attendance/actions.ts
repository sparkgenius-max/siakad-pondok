'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

interface AttendanceRecord {
    id: string
    santri_id: string
    status: 'present' | 'sick' | 'permission' | 'alpha'
    notes: string | null
    date: string
}

export async function saveAttendance(formData: FormData) {
    const supabase = await createClient()
    const rawData = Object.fromEntries(formData.entries())
    const date = rawData['date'] as string

    // Get all santri IDs from form
    const santriIds = Object.keys(rawData).filter(k => k.startsWith('status_')).map(k => k.replace('status_', ''))

    const records: Partial<AttendanceRecord>[] = santriIds.map(id => {
        const status = rawData[`status_${id}`] as any
        const notes = rawData[`notes_${id}`] as string || null
        const userId = (supabase.auth.getUser() as any)?.data?.user?.id

        return {
            santri_id: id,
            date: date,
            status: status,
            notes: notes,
            created_by: userId
        }
    })

    // Upsert (Insert or Update if exists)
    const { error } = await supabase
        .from('attendance')
        .upsert(records, { onConflict: 'santri_id, date' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/attendance')
    return { message: 'Absensi berhasil disimpan' }
}

export async function deleteAttendance(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('attendance').delete().eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/attendance')
}
