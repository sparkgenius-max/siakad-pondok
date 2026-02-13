import { createAdminClient } from '@/lib/supabase/admin'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ReportManager } from '@/components/reports/report-manager'

export const dynamic = 'force-dynamic'

export default async function ReportsPage() {
    const adminDb = createAdminClient()

    // Fetch all active santri with class and program info
    const { data: santriData } = await adminDb
        .from('santri')
        .select('id, name, nis, class, program')
        .eq('status', 'active')
        .order('name')

    const santriList = santriData || []

    // Process unique classes
    const uniqueClasses = [...new Set(santriList.map(s => s.class).filter(c => c && c !== '-'))].sort()

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Laporan & Raport</h2>
            </div>

            <ReportManager classes={uniqueClasses} santriList={santriList} />
        </div>
    )
}
