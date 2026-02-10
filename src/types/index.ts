export type Profile = {
    id: string;
    email: string;
    full_name: string;
    role: 'admin' | 'ustadz';
    created_at: string;
};

export type Santri = {
    id: string;
    nis: string;
    name: string;
    gender: 'L' | 'P';
    class: string;
    dorm: string;
    status: 'active' | 'inactive' | 'graduated';
    guardian_name: string;
    guardian_phone: string;
    created_at: string;
};

// Lightweight type for dropdown lists
export type SantriOption = Pick<Santri, 'id' | 'name' | 'nis'>;

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
    type: 'sick' | 'permit' | 'late' | 'other';
    start_date: string;
    end_date: string;
    reason: string;
    status: 'pending' | 'approved' | 'rejected';
    santri?: Santri; // Joined data
};

export type Grade = {
    id: string;
    santri_id: string;
    subject: string;
    semester: string;
    academic_year: string;
    grade: string;
    notes: string;
    santri?: Santri; // Joined data
};
