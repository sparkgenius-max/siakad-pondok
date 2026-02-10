import { Sidebar } from '@/components/layout/sidebar'
import Header from '@/components/layout/header'

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex h-screen overflow-hidden bg-muted/40">
            <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50">
                <Sidebar />
            </div>
            <div className="flex-1 flex flex-col md:pl-64 h-full">
                <Header />
                <main className="flex-1 overflow-y-auto p-4 md:p-6">
                    {children}
                </main>
            </div>
        </div>
    )
}
