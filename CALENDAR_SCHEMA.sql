-- Tabel Kalender Akademik
CREATE TABLE IF NOT EXISTS academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    category VARCHAR(50) CHECK (category IN ('holiday', 'exam', 'activity', 'meeting', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- RLS Policies
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON academic_calendar
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON academic_calendar
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for authenticated users" ON academic_calendar
    FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Enable delete access for authenticated users" ON academic_calendar
    FOR DELETE TO authenticated USING (true);

-- Dummy Data Categories
-- 'holiday': Libur
-- 'exam': Ujian
-- 'activity': Kegiatan Pondok (Maulid, Isra Miraj, dll)
-- 'meeting': Rapat Pengurus
-- 'other': Lainnya

-- Insert some dummy events
INSERT INTO academic_calendar (title, start_date, end_date, category, description)
VALUES 
    ('Ujian Tengah Semester', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '2 weeks 5 days', 'exam', 'UTS Semester Ganjil'),
    ('Libur Maulid Nabi', NOW() + INTERVAL '1 month', NOW() + INTERVAL '1 month', 'holiday', 'Peringatan Maulid Nabi Muhammad SAW'),
    ('Kajian Bulanan Wali Santri', NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days', 'activity', 'Kajian rutin bersama wali santri'),
    ('Rapat Kenaikan Kelas', NOW() + INTERVAL '3 months', NOW() + INTERVAL '3 months', 'meeting', 'Rapat dewan guru untuk kenaikan kelas');
