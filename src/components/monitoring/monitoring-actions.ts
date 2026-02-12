'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createMonitoring(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const adminDb = createAdminClient()

    const santri_id = formData.get('santri_id') as string
    const data = {
        santri_id,
        date: formData.get('date') as string,
        ziyadah_pages: Number(formData.get('ziyadah_pages')),
        murojaah_juz: Number(formData.get('murojaah_juz')),
        notes: formData.get('notes') as string,
    }

    const { error } = await adminDb.from('monitoring_tahfidz').insert(data)

    if (error) {
        console.error('[createMonitoring] Error:', error)
        return { error: error.message }
    }

    revalidatePath('/monitoring')
    revalidatePath('/monitoring-tahfidz')
    return { message: 'Data monitoring berhasil disimpan' }
}

export async function deleteMonitoring(id: string) {
    const adminDb = createAdminClient()
    const { error } = await adminDb.from('monitoring_tahfidz').delete().eq('id', id)

    if (error) throw new Error(error.message)
    revalidatePath('/monitoring')
    revalidatePath('/monitoring-tahfidz')
}

export async function saveRaport(prevState: any, formData: FormData) {
    const adminDb = createAdminClient()
    const santri_id = formData.get('santri_id') as string
    const semester = formData.get('semester') as string
    const year = formData.get('year') as string

    if (!santri_id || !semester || !year) {
        return { error: 'Data tidak lengkap' }
    }

    const { error: deleteError } = await adminDb.from('grades').delete()
        .eq('santri_id', santri_id)
        .eq('semester', semester)
        .eq('academic_year', year)
        .eq('program_type', 'Tahfidz')

    if (deleteError) console.error('Delete error', deleteError)

    // 1. Prepare Grades
    const subjects = ['KELANCARAN', 'FASHOHAH', 'TAJWID', 'SAMBUNG AYAT', 'TAKLIM KITAB SUBUH', 'TAKLIM KITAB ISYA’']
    const gradeInserts = subjects.map(subj => {
        const val = formData.get(`score_${subj}`)
        if (!val) return null
        return {
            santri_id,
            subject: subj,
            semester,
            academic_year: year,
            program_type: 'Tahfidz',
            score_total: Number(val),
        }
    }).filter(g => g !== null)

    if (gradeInserts.length > 0) {
        const { error: gradeError } = await adminDb.from('grades').insert(gradeInserts)
        if (gradeError) return { error: 'Gagal simpan nilai: ' + gradeError.message }
    }

    // 2. Prepare Raport Summary
    const summaryData = {
        santri_id,
        semester,
        year,
        program_type: 'Tahfidz',
        behavior_kerajinan: formData.get('behavior_kerajinan') as string,
        behavior_kedisiplinan: formData.get('behavior_kedisiplinan') as string,
        behavior_kerapian: formData.get('behavior_kerapian') as string,
        sakit: Number(formData.get('sakit') || 0),
        izin: Number(formData.get('izin') || 0),
        alfa: Number(formData.get('alfa') || 0),
    }

    // UPSERT SUMMARY
    const { data: existing } = await adminDb.from('raport_summaries')
        .select('id')
        .eq('santri_id', santri_id)
        .eq('semester', semester)
        .eq('year', year)
        .eq('program_type', 'Tahfidz')
        .single()

    if (existing) {
        const { error: sumError } = await adminDb.from('raport_summaries')
            .update(summaryData)
            .eq('id', existing.id)
        if (sumError) return { error: 'Gagal update raport: ' + sumError.message }
    } else {
        const { error: sumError } = await adminDb.from('raport_summaries')
            .insert(summaryData)
        if (sumError) return { error: 'Gagal buat raport: ' + sumError.message }
    }

    revalidatePath('/monitoring')
    return { message: 'Data raport berhasil disimpan' }
}
