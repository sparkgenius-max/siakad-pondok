'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createSantri(prevState: any, formData: FormData) {
    const supabase = await createClient()

    const data = {
        nis: formData.get('nis') as string,
        name: formData.get('name') as string,
        gender: formData.get('gender') as string,
        class: formData.get('class') as string,
        dorm: formData.get('dorm') as string,
        guardian_name: formData.get('guardian_name') as string,
        guardian_phone: formData.get('guardian_phone') as string,
        status: 'active',
    }

    const { error } = await supabase.from('santri').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/santri')
    return { message: 'Santri added successfully' }
}

export async function updateSantri(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const id = formData.get('id') as string

    const data = {
        nis: formData.get('nis') as string,
        name: formData.get('name') as string,
        gender: formData.get('gender') as string,
        class: formData.get('class') as string,
        dorm: formData.get('dorm') as string,
        guardian_name: formData.get('guardian_name') as string,
        guardian_phone: formData.get('guardian_phone') as string,
    }

    const { error } = await supabase.from('santri').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/santri')
    return { message: 'Santri updated successfully' }
}

export async function deleteSantri(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('santri').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/santri')
}
