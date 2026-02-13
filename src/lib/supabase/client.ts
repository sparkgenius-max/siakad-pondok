import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !key) {
        // In browser we might just return an object that will fail on use
        // but it's better to log it clearly
        console.error('[supabase client] Missing environment variables')
    }

    return createBrowserClient(
        url!,
        key!
    )
}

