'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Helper: Convert academic year + semester to date range
function getSemesterDateRange(academicYear: string, semester: string): { startDate: string; endDate: string } {
    // Format: "2024/2025"
    const [yearStart, yearEnd] = academicYear.split('/').map(Number)

    if (semester === 'Ganjil') {
        return {
            startDate: `${yearStart}-07-01`,
            endDate: `${yearStart}-12-31`,
        }
    } else {
        return {
            startDate: `${yearEnd}-01-01`,
            endDate: `${yearEnd}-06-30`,
        }
    }
}

// Compute attendance summary for multiple students from the attendance table
export async function getAttendanceSummaryBulk(
    santriIds: string[],
    academicYear: string,
    semester: string
): Promise<Record<string, { alfa: number; izin: number; sakit: number }>> {
    if (santriIds.length === 0) return {}

    const adminDb = createAdminClient()
    const { startDate, endDate } = getSemesterDateRange(academicYear, semester)

    const { data, error } = await adminDb
        .from('attendance')
        .select('santri_id, status')
        .in('santri_id', santriIds)
        .gte('date', startDate)
        .lte('date', endDate)

    if (error) {
        console.error('Error fetching attendance:', error)
        return {}
    }

    // Initialize all students with zero counts
    const result: Record<string, { alfa: number; izin: number; sakit: number }> = {}
    santriIds.forEach(id => {
        result[id] = { alfa: 0, izin: 0, sakit: 0 }
    })

    // Count statuses
    data?.forEach((record: any) => {
        const sid = record.santri_id
        if (!result[sid]) result[sid] = { alfa: 0, izin: 0, sakit: 0 }

        if (record.status === 'alpha') result[sid].alfa++
        else if (record.status === 'permission') result[sid].izin++
        else if (record.status === 'sick') result[sid].sakit++
    })

    return result
}

// Compute attendance summary for a single student
export async function getAttendanceSummary(
    santriId: string,
    academicYear: string,
    semester: string
): Promise<{ alfa: number; izin: number; sakit: number }> {
    const result = await getAttendanceSummaryBulk([santriId], academicYear, semester)
    return result[santriId] || { alfa: 0, izin: 0, sakit: 0 }
}

// Save bulk reports — behavior + auto-computed attendance
export async function saveBulkReports(formData: FormData) {
    const adminDb = createAdminClient()

    const program = formData.get('program') as string
    const academicYear = formData.get('academic_year') as string
    const semester = formData.get('semester') as string

    if (!program || !academicYear || !semester) {
        return { error: 'Data tidak lengkap' }
    }

    // Extract santri IDs from form keys (behavior_kerajinan_{id})
    const santriIds = Array.from(formData.keys())
        .filter(k => k.startsWith('behavior_kerajinan_'))
        .map(k => k.replace('behavior_kerajinan_', ''))

    if (santriIds.length === 0) {
        return { error: 'Tidak ada data santri untuk disimpan' }
    }

    // Compute attendance summaries automatically
    const attendanceSummaries = await getAttendanceSummaryBulk(santriIds, academicYear, semester)

    // Build upsert records
    const records = santriIds.map(id => {
        const kerajinan = formData.get(`behavior_kerajinan_${id}`) as string || ''
        const kedisiplinan = formData.get(`behavior_kedisiplinan_${id}`) as string || ''

        // Third category depends on program
        const thirdKey = program === 'Diniyah' ? 'kebersihan' : 'kerapian'
        const thirdValue = formData.get(`behavior_${thirdKey}_${id}`) as string || ''

        const notes = formData.get(`notes_${id}`) as string || ''

        const behavior: Record<string, string> = {
            kerajinan,
            kedisiplinan,
        }
        behavior[thirdKey] = thirdValue

        return {
            santri_id: id,
            program,
            academic_year: academicYear,
            semester,
            behavior,
            attendance_summary: attendanceSummaries[id] || { alfa: 0, izin: 0, sakit: 0 },
            notes: notes || null,
            updated_at: new Date().toISOString(),
        }
    })

    try {
        const { error } = await adminDb
            .from('student_reports')
            .upsert(records, { onConflict: 'santri_id, program, academic_year, semester' })

        if (error) throw error

        revalidatePath('/reports')
        return { message: `Data berhasil disimpan untuk ${records.length} santri` }
    } catch (error: any) {
        console.error('Error saving bulk reports:', error)
        return { error: error.message || 'Gagal menyimpan data' }
    }
}

// Get full report data for PDF generation
export async function getReportData(
    santriId: string,
    program: string,
    academicYear: string,
    semester: string
) {
    const adminDb = createAdminClient()

    // 1. Student info
    const { data: student } = await adminDb
        .from('santri')
        .select('*')
        .eq('id', santriId)
        .single()

    if (!student) return { error: 'Santri tidak ditemukan' }

    // 2. Grades
    const { data: grades } = await adminDb
        .from('grades')
        .select('*')
        .eq('santri_id', santriId)
        .eq('program_type', program)
        .eq('academic_year', academicYear)
        .eq('semester', semester)
        .order('subject')

    // 3. Hafalan (Tahfidz only)
    let hafalan: any[] = []
    if (program === 'Tahfidz') {
        const { startDate, endDate } = getSemesterDateRange(academicYear, semester)
        const { data: hafalanData } = await adminDb
            .from('monitoring_tahfidz')
            .select('*')
            .eq('santri_id', santriId)
            .gte('date', startDate)
            .lte('date', endDate)
            .order('date')
        hafalan = hafalanData || []
    }

    // 4. Behavior from student_reports
    const { data: report } = await adminDb
        .from('student_reports')
        .select('behavior, notes')
        .eq('santri_id', santriId)
        .eq('program', program)
        .eq('academic_year', academicYear)
        .eq('semester', semester)
        .single()

    // 5. Attendance — computed on-the-fly from attendance table
    const attendanceSummary = await getAttendanceSummary(santriId, academicYear, semester)

    return {
        student,
        grades: grades || [],
        hafalan,
        behavior: report?.behavior || {},
        attendanceSummary,
        notes: report?.notes || '',
    }
}

// Fetch existing reports for pre-filling bulk form
export async function getExistingReports(
    santriIds: string[],
    program: string,
    academicYear: string,
    semester: string
): Promise<Record<string, { behavior: any; notes: string }>> {
    if (santriIds.length === 0) return {}

    const adminDb = createAdminClient()

    const { data, error } = await adminDb
        .from('student_reports')
        .select('santri_id, behavior, notes')
        .in('santri_id', santriIds)
        .eq('program', program)
        .eq('academic_year', academicYear)
        .eq('semester', semester)

    if (error) {
        console.error('Error fetching existing reports:', error)
        return {}
    }

    const result: Record<string, { behavior: any; notes: string }> = {}
    data?.forEach((row: any) => {
        result[row.santri_id] = {
            behavior: row.behavior || {},
            notes: row.notes || '',
        }
    })
    return result
}

// Save single report — efficient for auto-save
export async function saveSingleReport(
    santriId: string,
    program: string,
    academicYear: string,
    semester: string,
    behavior: Record<string, string>,
    notes: string
) {
    const adminDb = createAdminClient()

    // Compute attendance
    const attendanceSummary = await getAttendanceSummary(santriId, academicYear, semester)

    try {
        const { error } = await adminDb
            .from('student_reports')
            .upsert({
                santri_id: santriId,
                program,
                academic_year: academicYear,
                semester,
                behavior,
                attendance_summary: attendanceSummary,
                notes: notes,
                updated_at: new Date().toISOString(),
            }, { onConflict: 'santri_id, program, academic_year, semester' })

        if (error) throw error

        revalidatePath('/reports')
        return { success: true }
    } catch (error: any) {
        console.error('Error saving single report:', error)
        return { error: error.message || 'Gagal menyimpan data' }
    }
}
