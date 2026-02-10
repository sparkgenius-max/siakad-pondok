-- Tabel Absensi Harian
CREATE TABLE IF NOT EXISTS attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    santri_id UUID REFERENCES santri(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'sick', 'permission', 'alpha')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    -- Satu santri hanya bisa absen 1x per hari
    UNIQUE(santri_id, date)
);

-- RLS Policies
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for authenticated users" ON attendance
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Enable insert access for authenticated users" ON attendance
    FOR INSERT TO authenticated WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Enable update access for users who created" ON attendance
    FOR UPDATE TO authenticated
    USING (auth.uid() = created_by)
    WITH CHECK (auth.uid() = created_by);

-- Dummy Data Absensi (Hari ini)
INSERT INTO attendance (santri_id, date, status, notes)
SELECT 
    id, 
    CURRENT_DATE, 
    CASE 
        WHEN random() < 0.85 THEN 'present'
        WHEN random() < 0.90 THEN 'sick'
        WHEN random() < 0.95 THEN 'permission'
        ELSE 'alpha'
    END,
    NULL
FROM santri 
WHERE status = 'active'
ON CONFLICT DO NOTHING;
