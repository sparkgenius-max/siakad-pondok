'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createPermission(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user

    const santri_id = formData.get('santri_id') as string
    const data = {
        santri_id,
        type: formData.get('type') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        reason: formData.get('reason') as string,
        status: 'pending',
        created_by: user?.id,
    }

    const { error } = await supabase.from('permissions').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/permissions')
    revalidatePath(`/permissions/santri/${santri_id}`)
    revalidatePath('/') // Dashboard might show pending count
    return { message: 'Perizinan berhasil diajukan' }
}

export async function updatePermission(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string
    const santri_id = formData.get('santri_id') as string

    const data = {
        type: formData.get('type') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        reason: formData.get('reason') as string,
    }

    const { error } = await supabase.from('permissions').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/permissions')
    revalidatePath(`/permissions/santri/${santri_id}`)
    return { message: 'Perizinan berhasil diperbarui' }
}

export async function updatePermissionStatus(id: string, status: 'approved' | 'rejected', santriId?: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user

    const { error } = await supabase
        .from('permissions')
        .update({
            status,
            approved_by: user?.id,
            approved_at: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/permissions')
    revalidatePath('/') // Dashboard shows pending count
    if (santriId) {
        revalidatePath(`/permissions/santri/${santriId}`)
    }
}

export async function deletePermission(id: string, santriId?: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('permissions').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/permissions')
    if (santriId) {
        revalidatePath(`/permissions/santri/${santriId}`)
    }
}
