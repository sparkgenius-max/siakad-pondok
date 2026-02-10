'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createGrade(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const santri_id = formData.get('santri_id') as string

    const data = {
        santri_id,
        subject: formData.get('subject') as string,
        semester: formData.get('semester') as string,
        academic_year: formData.get('academic_year') as string,
        grade: formData.get('grade') as string,
        notes: formData.get('notes') as string,
        created_by: (await supabase.auth.getUser()).data.user?.id,
    }

    const { error } = await supabase.from('grades').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/grades')
    revalidatePath(`/grades/santri/${santri_id}`)
    return { message: 'Nilai berhasil disimpan' }
}

export async function updateGrade(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const santri_id = formData.get('santri_id') as string

    const data = {
        subject: formData.get('subject') as string,
        semester: formData.get('semester') as string,
        academic_year: formData.get('academic_year') as string,
        grade: formData.get('grade') as string,
        notes: formData.get('notes') as string,
    }

    const { error } = await supabase.from('grades').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/grades')
    revalidatePath(`/grades/santri/${santri_id}`)
    return { message: 'Nilai berhasil diperbarui' }
}

export async function deleteGrade(id: string, santriId?: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('grades').delete().eq('id', id)

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
    grade: string
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

    const toInsert: any[] = []
    const toUpdate: { id: string; grade: string; notes: string }[] = []

    data.grades.forEach(entry => {
        if (entry.existing_id) {
            toUpdate.push({
                id: entry.existing_id,
                grade: entry.grade,
                notes: entry.notes
            })
        } else {
            toInsert.push({
                santri_id: entry.santri_id,
                subject: data.subject,
                semester: data.semester,
                academic_year: data.academic_year,
                grade: entry.grade,
                notes: entry.notes || null,
                created_by: userId
            })
        }
    })

    let insertError = null
    let updateError = null

    // Insert new grades
    if (toInsert.length > 0) {
        const { error } = await supabase.from('grades').insert(toInsert)
        insertError = error
    }

    // Update existing grades
    for (const update of toUpdate) {
        const { error } = await supabase
            .from('grades')
            .update({ grade: update.grade, notes: update.notes })
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

    const insertedCount = toInsert.length
    const updatedCount = toUpdate.length

    return {
        message: `Berhasil: ${insertedCount} nilai baru, ${updatedCount} diperbarui`,
        inserted: insertedCount,
        updated: updatedCount
    }
}
