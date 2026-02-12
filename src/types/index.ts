export type Profile = {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'ustadz' | 'pengasuh';
    created_at: string;
};

export type Program = {
    id: string;
    code: string;
    name: string;
    category: 'tahfidz' | 'diniyah' | 'entrepreneurship';
    has_grades: boolean;
    has_tahfidz: boolean;
    sort_order: number;
};

export type SantriProgram = {
    id: string;
    santri_id: string;
    program_id: string;
    enrolled_at: string;
    status: 'active' | 'completed' | 'dropped';
    program?: Program; // Joined
};

export type Santri = {
    id: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    class: string;
    dorm: string;
    program: string; // 'Tahfidz' or 'Diniyah'
    origin_address?: string;
    status: 'active' | 'inactive' | 'graduated';
    guardian_name: string;
    guardian_phone: string;
    created_at: string;
};

export type SantriOption = Pick<Santri, 'id' | 'name' | 'nis' | 'class'>;

export type Payment = {
    id: string;
    santri_id: string;
    amount: number;
    payment_date: string;
    month: number;
    year: number;
    status: 'paid' | 'pending' | 'partial';
    notes: string;
    santri?: Santri; // Joined data
};

export type Permission = {
    id: string;
    santri_id: string;
    type: 'sick' | 'permit' | 'late' | 'other' | 'pulang' | 'kegiatan_luar' | 'organisasi';
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected' | 'berlangsung' | 'selesai' | 'terlambat';
    santri?: Santri; // Joined data
};

export type Grade = {
    id: string;
    santri_id: string;
    subject: string;
    semester: string;
    academic_year: string;
    program_type?: string; // 'Tahfidz' or 'Diniyah'
    score_theory?: number;
    score_practice?: number;
    score_total?: number;
    grade?: string; // Legacy
    notes?: string;
    santri?: Santri;
};

export type MonitoringTahfidz = {
    id: string;
    santri_id: string;
    date: string;
    ziyadah_pages: number;
    murojaah_juz: number;
    notes: string;
    created_by: string;
    created_at: string;
    santri?: Santri;
};
