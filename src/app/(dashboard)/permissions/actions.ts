'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createPermission(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'Unauthorized' }
    }

    const adminDb = createAdminClient()

    const santri_id = formData.get('santri_id') as string
    const data = {
        santri_id,
        type: formData.get('type') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        reason: formData.get('reason') as string,
        status: (formData.get('status') as string) || 'berlangsung',
        created_by: user.id,
    }

    const { error } = await adminDb.from('permissions').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/permissions')
    revalidatePath(`/permissions/santri/${santri_id}`)
    revalidatePath('/')
    return { message: 'Perizinan berhasil diajukan' }
}

export async function updatePermission(prevState: any, formData: FormData) {
    const id = formData.get('id') as string
    const santri_id = formData.get('santri_id') as string

    const adminDb = createAdminClient()

    const data = {
        type: formData.get('type') as string,
        start_date: formData.get('start_date') as string,
        end_date: formData.get('end_date') as string,
        reason: formData.get('reason') as string,
    }

    const { error } = await adminDb.from('permissions').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/permissions')
    revalidatePath(`/permissions/santri/${santri_id}`)
    return { message: 'Perizinan berhasil diperbarui' }
}

export async function updatePermissionStatus(id: string, status: 'approved' | 'rejected' | 'berlangsung' | 'selesai' | 'terlambat', santriId?: string) {
    const supabase = await createClient()
    const user = (await supabase.auth.getUser()).data.user

    const adminDb = createAdminClient()

    const { error } = await adminDb
        .from('permissions')
        .update({
            status,
            approved_by: user?.id,
            approval_date: new Date().toISOString()
        })
        .eq('id', id)

    if (error) {
        console.error('[updatePermissionStatus] Error:', error)
        throw new Error(error.message)
    }

    revalidatePath('/permissions')
    revalidatePath('/')
    if (santriId) {
        revalidatePath(`/permissions/santri/${santriId}`)
    }
}

export async function deletePermission(id: string, santriId?: string) {
    const adminDb = createAdminClient()
    const { error } = await adminDb.from('permissions').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/permissions')
    if (santriId) {
        revalidatePath(`/permissions/santri/${santriId}`)
    }
}
