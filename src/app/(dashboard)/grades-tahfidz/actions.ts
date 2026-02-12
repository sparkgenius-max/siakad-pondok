'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createTahfidzGrade(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminDb = createAdminClient()
    const santri_id = formData.get('santri_id') as string

    const data = {
        santri_id,
        subject: formData.get('subject') as string,
        semester: formData.get('semester') as string,
        academic_year: formData.get('academic_year') as string,
        score_total: parseFloat(formData.get('score_total') as string) || 0,
        program_type: 'Tahfidz',
        notes: formData.get('notes') as string,
        created_by: user?.id,
    }

    const { error } = await adminDb.from('grades').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/grades-tahfidz')
    revalidatePath(`/santri/${santri_id}`)
    return { message: 'Nilai berhasil disimpan' }
}

export async function updateTahfidzGrade(prevState: any, formData: FormData) {
    const id = formData.get('id') as string
    const santri_id = formData.get('santri_id') as string

    const adminDb = createAdminClient()

    const data = {
        subject: formData.get('subject') as string,
        semester: formData.get('semester') as string,
        academic_year: formData.get('academic_year') as string,
        score_total: parseFloat(formData.get('score_total') as string) || 0,
        notes: formData.get('notes') as string,
    }

    const { error } = await adminDb.from('grades').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/grades-tahfidz')
    revalidatePath(`/santri/${santri_id}`)
    return { message: 'Nilai berhasil diperbarui' }
}

export async function deleteTahfidzGrade(id: string, santriId?: string) {
    const adminDb = createAdminClient()
    const { error } = await adminDb.from('grades').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/grades-tahfidz')
    if (santriId) {
        revalidatePath(`/santri/${santriId}`)
    }
}

interface BatchTahfidzGradeEntry {
    santri_id: string
    score_total: string
    notes: string
    existing_id?: string
}

interface BatchTahfidzGradeData {
    grades: BatchTahfidzGradeEntry[]
    subject: string
    semester: string
    academic_year: string
}

export async function saveBatchTahfidzGrades(data: BatchTahfidzGradeData) {
    const supabase = await createClient()
    const userId = (await supabase.auth.getUser()).data.user?.id

    const adminDb = createAdminClient()

    const toInsert: any[] = []
    const toUpdate: { id: string; score_total: number; notes: string }[] = []

    data.grades.forEach(entry => {
        const total = parseFloat(entry.score_total) || 0

        if (entry.existing_id) {
            toUpdate.push({
                id: entry.existing_id,
                score_total: total,
                notes: entry.notes
            })
        } else {
            toInsert.push({
                santri_id: entry.santri_id,
                subject: data.subject,
                semester: data.semester,
                academic_year: data.academic_year,
                program_type: 'Tahfidz',
                score_total: total,
                notes: entry.notes || null,
                created_by: userId
            })
        }
    })

    let insertError = null
    let updateError = null

    if (toInsert.length > 0) {
        const { error } = await adminDb.from('grades').insert(toInsert)
        if (error) insertError = error
    }

    for (const update of toUpdate) {
        const { error } = await adminDb
            .from('grades')
            .update({
                score_total: update.score_total,
                notes: update.notes
            })
            .eq('id', update.id)
        if (error) {
            updateError = error
            break
        }
    }

    if (insertError || updateError) {
        return { error: (insertError || updateError)?.message || 'Gagal menyimpan nilai' }
    }

    revalidatePath('/grades-tahfidz')
    revalidatePath('/grades-tahfidz/batch')

    return {
        message: `Berhasil: ${toInsert.length} nilai baru, ${toUpdate.length} diperbarui`,
        inserted: toInsert.length,
        updated: toUpdate.length
    }
}
