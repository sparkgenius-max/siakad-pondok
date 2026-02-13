'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createSantri(prevState: any, formData: FormData) {
    const supabase = createAdminClient()
    const nis = formData.get('nis') as string

    const data: any = {
        name: formData.get('name') as string,
        gender: formData.get('gender') as string,
        class: formData.get('class') as string,
        dorm: formData.get('dorm') as string,
        origin_address: formData.get('origin_address') as string,
        guardian_name: formData.get('guardian_name') as string,
        guardian_phone: formData.get('guardian_phone') as string,
        program: formData.get('program') as string,
        status: 'active',
    }

    // Only include NIS if provided (e.g. from an import or explicit manual entry if somehow allowed)
    // Otherwise, the database DEFAULT will kick in.
    if (nis && nis.trim() !== '') {
        data.nis = nis
    }

    const { error } = await supabase
        .from('santri')
        .insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/santri')
    revalidatePath('/attendance')
    revalidatePath('/reports')
    revalidatePath('/monitoring')
    return { message: 'Santri berhasil ditambahkan' }
}

export async function updateSantri(prevState: any, formData: FormData) {
    const supabase = createAdminClient()
    const id = formData.get('id') as string

    const data = {
        nis: formData.get('nis') as string,
        name: formData.get('name') as string,
        gender: formData.get('gender') as string,
        class: formData.get('class') as string,
        dorm: formData.get('dorm') as string,
        origin_address: formData.get('origin_address') as string,
        guardian_name: formData.get('guardian_name') as string,
        guardian_phone: formData.get('guardian_phone') as string,
        program: formData.get('program') as string,
        status: formData.get('status') as string,
    }

    const { error } = await supabase.from('santri').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/santri')
    revalidatePath('/attendance')
    revalidatePath('/reports')
    revalidatePath('/monitoring')
    revalidatePath(`/santri/${id}`)
    return { message: 'Santri berhasil diperbarui' }
}

export async function deleteSantri(id: string) {
    const supabase = createAdminClient()
    const { error } = await supabase.from('santri').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/santri')
    revalidatePath('/attendance')
    revalidatePath('/reports')
    revalidatePath('/monitoring')
}

export async function importSantri(data: any[]) {
    const supabase = createAdminClient()

    // Map and sanitize the data
    const santriData = data.map(item => {
        const program = String(item.program || item.Program || 'Tahfidz');
        let className = String(item.kelas || item.class || item.Kelas || '').trim();

        // Auto-set class to '-' for Tahfidz if empty
        if (program.toLowerCase() === 'tahfidz' && (!className || className === '')) {
            className = '-';
        }

        const nis = String(item.nis || item.NIS || '').trim();
        const entry: any = {
            name: String(item.nama || item.name || item.Name || ''),
            gender: String(item.jk || item.gender || item.JenisKelamin || item['Jenis Kelamin'] || 'L').toUpperCase().startsWith('P') ? 'P' : 'L',
            class: className,
            dorm: String(item.asrama || item.dorm || item.Asrama || ''),
            origin_address: String(item.alamat || item.address || item.Alamat || ''),
            guardian_name: String(item.wali || item.guardian || item['Nama Wali'] || ''),
            guardian_phone: String(item.hp_wali || item.phone || item['No HP Wali'] || ''),
            program: program,
            status: 'active',
        }

        if (nis) {
            entry.nis = nis
        }

        return entry
    })

    // Basic validation - now only name is strictly required if we generate NIS via DB
    const validData = santriData.filter(s => s.name)

    if (validData.length === 0) {
        return { error: 'Tidak ada data valid untuk diimpor. Pastikan kolom Nama terisi.' }
    }

    const { error } = await supabase
        .from('santri')
        .upsert(validData, { onConflict: 'nis' })

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/santri')
    revalidatePath('/attendance')
    revalidatePath('/reports')
    revalidatePath('/monitoring')
    return { success: true, count: validData.length }
}
