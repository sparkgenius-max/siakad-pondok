'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export async function createPayment(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const adminDb = createAdminClient()

    const data = {
        santri_id: formData.get('santri_id') as string,
        amount: parseFloat(formData.get('amount') as string),
        payment_date: formData.get('payment_date') as string,
        month: parseInt(formData.get('month') as string),
        year: parseInt(formData.get('year') as string),
        status: formData.get('status') as string,
        notes: formData.get('notes') as string,

    }

    const { error } = await adminDb.from('payments').insert(data)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/payments')
    revalidatePath(`/payments/santri/${data.santri_id}`)
    return { message: 'Payment recorded successfully' }
}

export async function updatePayment(prevState: any, formData: FormData) {
    const id = formData.get('id') as string
    const santri_id = formData.get('santri_id') as string

    const adminDb = createAdminClient()

    const data = {
        amount: parseFloat(formData.get('amount') as string),
        payment_date: formData.get('payment_date') as string,
        month: parseInt(formData.get('month') as string),
        year: parseInt(formData.get('year') as string),
        status: formData.get('status') as string,
        notes: formData.get('notes') as string,
    }

    const { error } = await adminDb.from('payments').update(data).eq('id', id)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/payments')
    revalidatePath(`/payments/santri/${santri_id}`)
    return { message: 'Payment updated successfully' }
}

export async function deletePayment(id: string, santriId?: string) {
    const adminDb = createAdminClient()
    const { error } = await adminDb.from('payments').delete().eq('id', id)

    if (error) {
        throw new Error(error.message)
    }

    revalidatePath('/payments')
    if (santriId) {
        revalidatePath(`/payments/santri/${santriId}`)
    }
}

interface BulkPaymentData {
    santri_ids: string[]
    month: number
    year: number
    amount: number
}

export async function generateBulkPayments(data: BulkPaymentData) {
    const supabase = await createClient()
    const userId = (await supabase.auth.getUser()).data.user?.id
    const today = new Date().toISOString().split('T')[0]

    const adminDb = createAdminClient()

    const records = data.santri_ids.map(santri_id => ({
        santri_id,
        amount: data.amount,
        month: data.month,
        year: data.year,
        payment_date: today,
        status: 'paid',
        notes: 'Generated via bulk payment',

    }))

    const { error } = await adminDb.from('payments').insert(records)

    if (error) {
        return { error: error.message }
    }

    revalidatePath('/payments')
    revalidatePath('/payments/bulk')
    revalidatePath('/')

    return {
        message: `Berhasil membuat ${records.length} pembayaran`,
        count: records.length
    }
}
