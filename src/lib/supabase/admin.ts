import { createClient } from '@supabase/supabase-js'

export const createAdminClient = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

    // Log check in production for debugging (sensitive keys are hidden)
    if (!supabaseUrl || !supabaseServiceRoleKey) {
        console.error('[createAdminClient] Missing environment variables:', {
            url: !!supabaseUrl,
            key: !!supabaseServiceRoleKey
        })
        throw new Error('Supabase Admin environment variables are missing. Please check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel.')
    }

    return createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false
        }
    })
}

