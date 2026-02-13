import { Sidebar } from '@/components/layout/sidebar'
import Header from '@/components/layout/header'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let role = 'guru'
    let profileError = null
    let profileData = null

    if (user) {
        // Use Admin Client to bypass RLS and guarantee we get the profile
        const adminAuth = createAdminClient()
        const { data, error } = await adminAuth.from('profiles').select('role').eq('id', user.id).single()

        profileData = data
        profileError = error

        if (error) {
            console.error('[DashboardLayout] Error fetching profile:', error)
        }

        if (data) {
            role = data.role
        }
    }

    return (
        <div className="flex h-screen overflow-hidden bg-muted/40">
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar role={role} />
            </div>
            <div className="flex-1 flex flex-col md:pl-64 h-full">
                <Header role={role} email={user?.email} />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
