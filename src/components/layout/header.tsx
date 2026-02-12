import { UserNav } from './user-nav'
import { createClient } from '@/lib/supabase/server'
import { MobileSidebar } from './mobile-sidebar'

export default async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = 'guru'
    if (user) {
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
        if (profile) {
            role = profile.role
        }
    }

    return (
        <div className="border-b bg-background/95 backdrop-blur-sm sticky top-0 z-50">
            <div className="flex h-16 items-center px-4">
                <MobileSidebar role={role} />
                <h2 className="text-xl font-bold md:hidden ml-2 text-primary">SIPPIA</h2>
                <div className="ml-auto flex items-center space-x-4 md:hidden">
                    {user && <UserNav email={user.email!} />}
                </div>
            </div>
        </div>
    )
}
