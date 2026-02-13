'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'

export async function login(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        return { error: 'Invalid credentials. Please try again.' }
    }

    if (error) {
        redirect('/login?error=Could not authenticate user')
    }

    revalidatePath('/', 'layout')
    redirect('/')
}

export async function logout() {
    console.log('[Auth Action] Logging out...')
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
        console.error('[Auth Action] Logout error:', error)
    }

    console.log('[Auth Action] Logout successful, redirecting to /login')
    revalidatePath('/', 'layout')
    redirect('/login')
}
