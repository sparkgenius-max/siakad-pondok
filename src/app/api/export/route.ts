import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    if (!type || !['santri', 'payments', 'grades', 'permissions', 'attendance'].includes(type)) {
        return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }

    const supabase = createAdminClient()
    let data: any[] = []

    switch (type) {
        case 'santri':
            const { data: santriData } = await supabase
                .from('santri')
                .select('nis, name, class, dorm, guardian_name, guardian_phone, status, created_at')
                .order('name')

            data = (santriData || []).map(s => ({
                NIS: s.nis,
                'Nama Santri': s.name,
                Kelas: s.class,
                Asrama: s.dorm,
                'Nama Wali': s.guardian_name,
                'No. HP Wali': s.guardian_phone,
                Status: s.status === 'active' ? 'Aktif' : 'Tidak Aktif',
                'Tanggal Daftar': new Date(s.created_at).toLocaleDateString('id-ID')
            }))
            break

        case 'payments':
            const { data: paymentData } = await supabase
                .from('payments')
                .select('*, santri(name, nis)')
                .order('payment_date', { ascending: false })

            data = (paymentData || []).map(p => ({
                'Tanggal': new Date(p.payment_date).toLocaleDateString('id-ID'),
                NIS: p.santri?.nis,
                'Nama Santri': p.santri?.name,
                Bulan: p.month,
                Tahun: p.year,
                Jumlah: p.amount,
                Status: p.status === 'paid' ? 'Lunas' : p.status === 'partial' ? 'Sebagian' : 'Pending',
                Catatan: p.notes || '-'
            }))
            break

        case 'grades':
            const { data: gradeData } = await supabase
                .from('grades')
                .select('*, santri(name, nis, class)')
                .order('academic_year', { ascending: false })

            data = (gradeData || []).map(g => ({
                NIS: g.santri?.nis,
                'Nama Santri': g.santri?.name,
                'Program': g.program_type,
                Kelas: g.santri?.class,
                'Mata Pelajaran': g.subject,
                Semester: g.semester,
                'Tahun Ajaran': g.academic_year,
                'Teori': g.score_theory,
                'Praktik': g.score_practice,
                'Total': g.score_total,
                Catatan: g.notes || '-'
            }))
            break

        case 'permissions':
            const { data: permissionData } = await supabase
                .from('permissions')
                .select('*, santri(name, nis, class)')
                .order('created_at', { ascending: false })

            const typeLabels: Record<string, string> = {
                pulang: 'Pulang',
                kegiatan_luar: 'Kegiatan Luar',
                organisasi: 'Organisasi',
                sick: 'Sakit',
                permit: 'Izin'
            }

            const statusLabels: Record<string, string> = {
                pending: 'Menunggu',
                berlangsung: 'Berlangsung',
                selesai: 'Selesai',
                terlambat: 'Terlambat',
                approved: 'Disetujui',
                rejected: 'Ditolak'
            }

            data = (permissionData || []).map(p => ({
                NIS: p.santri?.nis,
                'Nama Santri': p.santri?.name,
                Kelas: p.santri?.class,
                Jenis: typeLabels[p.type] || p.type,
                'Tanggal Mulai': new Date(p.start_date).toLocaleDateString('id-ID'),
                'Tanggal Selesai': new Date(p.end_date).toLocaleDateString('id-ID'),
                Alasan: p.reason,
                Status: statusLabels[p.status] || p.status,
                'Tanggal Pengajuan': new Date(p.created_at).toLocaleDateString('id-ID')
            }))
            break

        case 'attendance':
            const { data: attendanceData } = await supabase
                .from('attendance')
                .select('*, santri(name, nis, class)')
                .order('date', { ascending: false })

            const attendanceStatus: Record<string, string> = {
                present: 'Hadir',
                sick: 'Sakit',
                permission: 'Izin',
                alpha: 'Alpha'
            }

            data = (attendanceData || []).map(a => ({
                Tanggal: new Date(a.date).toLocaleDateString('id-ID'),
                NIS: a.santri?.nis,
                'Nama Santri': a.santri?.name,
                Kelas: a.santri?.class,
                Status: attendanceStatus[a.status] || a.status,
                Catatan: a.notes || '-'
            }))
            break
    }

    return NextResponse.json(data)
}
