'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createGrade(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminDb = createAdminClient()
    const santri_id = formData.get('santri_id') as string

    const data = {
        santri_id,
        subject: formData.get('subject') as string,
        semester: formData.get('semester') as string,
        academic_year: formData.get('academic_year') as string,
        score_theory: parseFloat(formData.get('score_theory') as string) || 0,
        score_practice: parseFloat(formData.get('score_practice') as string) || 0,
        score_total: (parseFloat(formData.get('score_theory') as string) + parseFloat(formData.get('score_practice') as string)) / 2 || 0,
        program_type: 'Diniyah',
        notes: formData.get('notes') as string,
        created_by: user?.id,
    }

    const { error } = await adminDb.from('grades').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/grades')
    revalidatePath(`/grades/santri/${santri_id}`)
    return { message: 'Nilai berhasil disimpan' }
}

export async function updateGrade(prevState: any, formData: FormData) {
    const id = formData.get('id') as string
    const santri_id = formData.get('santri_id') as string

    const adminDb = createAdminClient()

    const data = {
        subject: formData.get('subject') as string,
        semester: formData.get('semester') as string,
        academic_year: formData.get('academic_year') as string,
        score_theory: parseFloat(formData.get('score_theory') as string) || 0,
        score_practice: parseFloat(formData.get('score_practice') as string) || 0,
        score_total: (parseFloat(formData.get('score_theory') as string) + parseFloat(formData.get('score_practice') as string)) / 2 || 0,
        notes: formData.get('notes') as string,
    }

    const { error } = await adminDb.from('grades').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/grades')
    revalidatePath(`/grades/santri/${santri_id}`)
    return { message: 'Nilai berhasil diperbarui' }
}

export async function deleteGrade(id: string, santriId?: string) {
    const adminDb = createAdminClient()
    const { error } = await adminDb.from('grades').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/grades')
    if (santriId) {
        revalidatePath(`/grades/santri/${santriId}`)
    }
}

interface BatchGradeEntry {
    santri_id: string
    score_theory: string
    score_practice: string
    notes: string
    existing_id?: string
}

interface BatchGradeData {
    grades: BatchGradeEntry[]
    subject: string
    semester: string
    academic_year: string
}

export async function saveBatchGrades(data: BatchGradeData) {
    const supabase = await createClient()
    const userId = (await supabase.auth.getUser()).data.user?.id

    const adminDb = createAdminClient()

    const toInsert: any[] = []
    const toUpdate: { id: string; score_theory: number; score_practice: number; score_total: number; notes: string }[] = []

    data.grades.forEach(entry => {
        const theory = parseFloat(entry.score_theory) || 0
        const practice = parseFloat(entry.score_practice) || 0
        const total = (theory + practice) / 2

        if (entry.existing_id) {
            toUpdate.push({
                id: entry.existing_id,
                score_theory: theory,
                score_practice: practice,
                score_total: total,
                notes: entry.notes
            })
        } else {
            toInsert.push({
                santri_id: entry.santri_id,
                subject: data.subject,
                semester: data.semester,
                academic_year: data.academic_year,
                program_type: 'Diniyah',
                score_theory: theory,
                score_practice: practice,
                score_total: total,
                notes: entry.notes || null,
                created_by: userId
            })
        }
    })

    let insertError = null
    let updateError = null

    // Insert new grades
    if (toInsert.length > 0) {
        const { error } = await adminDb.from('grades').insert(toInsert)
        if (error) insertError = error
    }

    // Update existing grades
    for (const update of toUpdate) {
        const { error } = await adminDb
            .from('grades')
            .update({
                score_theory: update.score_theory,
                score_practice: update.score_practice,
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

    revalidatePath('/grades')
    revalidatePath('/grades/batch')

    return {
        message: `Berhasil: ${toInsert.length} nilai baru, ${toUpdate.length} diperbarui`,
        inserted: toInsert.length,
        updated: toUpdate.length
    }
}

// --- TAHFIDZ ACTIONS ---

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

    revalidatePath('/grades')
    revalidatePath(`/grades/santri/${santri_id}`)
    return { message: 'Nilai Tahfidz berhasil disimpan' }
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

    revalidatePath('/grades')
    revalidatePath(`/grades/santri/${santri_id}`)
    return { message: 'Nilai Tahfidz berhasil diperbarui' }
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

    // Insert new grades
    if (toInsert.length > 0) {
        const { error } = await adminDb.from('grades').insert(toInsert)
        if (error) insertError = error
    }

    // Update existing grades
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

    revalidatePath('/grades')
    revalidatePath('/grades/batch/tahfidz')

    return {
        message: `Berhasil: ${toInsert.length} nilai baru, ${toUpdate.length} diperbarui`,
        inserted: toInsert.length,
        updated: toUpdate.length
    }
}

export async function upsertBulkGrades(grades: any[]) {
    try {
        const supabase = await createAdminClient()

        // Transform data to match DB schema if needed, but assuming input is already correct
        // We use upsert to handle both insert and update
        const { data, error } = await supabase
            .from('grades')
            .upsert(grades, {
                onConflict: 'santri_id, subject, semester, academic_year, program_type',
                ignoreDuplicates: false
            })
            .select()

        if (error) {
            console.error('Error bulk upserting grades:', error)
            return { error: error.message }
        }

        revalidatePath('/grades')
        revalidatePath('/grades-tahfidz')
        return { success: true, count: data?.length }
    } catch (error) {
        console.error('Server action error:', error)
        return { error: 'Internal Server Error' }
    }
}
