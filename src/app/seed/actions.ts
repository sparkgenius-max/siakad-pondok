'use server'

import { createAdminClient } from '@/lib/supabase/admin'

export async function seedUser(email: string, role: string, name: string) {
    const supabase = createAdminClient()
    const password = role + '123' // e.g. admin123

    console.log(`Attempting to seed user: ${email} with role: ${role}`)

    // 1. Create User via Admin API (Bypasses rate limit, handles hashing correctly)
    const metadata = {
        full_name: name,
        role: role
    }
    console.log('Sending metadata:', metadata)

    let { data: user, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: metadata
    })

    if (createError) {
        if (createError.message.toLowerCase().includes('already registered') || createError.status === 422) {
            console.log('User already exists, updating password instead...')
            const { data: { users } } = await supabase.auth.admin.listUsers()
            const existingUser = users.find(u => u.email === email)

            if (existingUser) {
                const { error: updateError } = await supabase.auth.admin.updateUserById(
                    existingUser.id,
                    { password: password, user_metadata: metadata }
                )
                if (updateError) return { success: false, error: updateError.message }

                // Continue to profile update
                user = { user: existingUser as any }
            } else {
                return { success: false, error: createError.message }
            }
        } else {
            return { success: false, error: createError.message }
        }
    }

    if (!user.user) {
        return { success: false, error: 'User creation failed implicitly.' }
    }

    // 2. Ensure Profile Role is Correct (Admin update)
    // The trigger might handle this, but explicit update is safer
    const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
            id: user.user.id,
            email: email,
            full_name: name,
            role: role
        })

    if (profileError) {
        console.error('Error updating profile:', profileError)
        // Don't fail the whole process if profile update fails, user exists at least. 
        // But it's good to know.
        return { success: true, message: `User created but profile update failed: ${profileError.message}` }
    }

    return { success: true, message: `User ${email} created successfully with password ${password}` }
}
