import { UserNav } from './user-nav'
import { createClient } from '@/lib/supabase/server'

export default async function Header() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    return (
        <div className="border-b bg-background">
            <div className="flex h-16 items-center px-4">
                <h2 className="text-lg font-semibold md:hidden">SIAKAD</h2>
                <div className="ml-auto flex items-center space-x-4">
                    {user && <UserNav email={user.email!} />}
                </div>
            </div>
        </div>
    )
}
