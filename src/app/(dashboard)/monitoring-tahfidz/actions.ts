'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createTahfidzRecord(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user

    const santri_id = formData.get('santri_id') as string
    const date = formData.get('date') as string
    const ziyadah_pages = Number(formData.get('ziyadah_pages'))
    const murojaah_juz = Number(formData.get('murojaah_juz'))
    const notes = formData.get('notes') as string

    if (!santri_id || !date) {
        return { error: 'Santri and Date are required' }
    }

    const adminDb = createAdminClient()

    const { error } = await adminDb.from('monitoring_tahfidz').insert({
        santri_id,
        date,
        ziyadah_pages: ziyadah_pages || 0,
        murojaah_juz: murojaah_juz || 0,
        notes,
    })

    if (error) {
        console.error('[createTahfidzRecord] Error:', error)
        return { error: error.message }
    }

    revalidatePath('/monitoring-tahfidz')
    revalidatePath('/monitoring')
    return { message: 'Data Tahfidz berhasil disimpan' }
}
