-- ============================================
-- DUMMY DATA UNTUK SIAKAD PONDOK
-- Execute file ini di Supabase SQL Editor
-- ============================================

-- Hapus data lama (opsional, uncomment jika perlu reset)
-- TRUNCATE TABLE grades, permissions, payments, santri CASCADE;

-- ============================================
-- 1. DATA SANTRI (20 santri)
-- ============================================

INSERT INTO santri (id, nis, name, class, dorm, guardian_name, guardian_phone, status, created_at) VALUES
-- Kelas 1A (5 santri)
('11111111-1111-1111-1111-111111111101', '2024001', 'Ahmad Fauzi Rahman', '1A', 'Asrama Al-Fatih', 'Bapak Hasan Rahman', '081234567801', 'active', NOW()),
('11111111-1111-1111-1111-111111111102', '2024002', 'Muhammad Rizki Pratama', '1A', 'Asrama Al-Fatih', 'Bapak Dedi Pratama', '081234567802', 'active', NOW()),
('11111111-1111-1111-1111-111111111103', '2024003', 'Abdullah Hakim', '1A', 'Asrama Al-Fatih', 'Bapak Mahmud Hakim', '081234567803', 'active', NOW()),
('11111111-1111-1111-1111-111111111104', '2024004', 'Umar Faruq Hidayat', '1A', 'Asrama Al-Fatih', 'Bapak Sugeng Hidayat', '081234567804', 'active', NOW()),
('11111111-1111-1111-1111-111111111105', '2024005', 'Bilal Ramadhan', '1A', 'Asrama Al-Fatih', 'Bapak Andi Ramadhan', '081234567805', 'active', NOW()),

-- Kelas 1B (5 santri)
('11111111-1111-1111-1111-111111111106', '2024006', 'Yusuf Maulana', '1B', 'Asrama Al-Huda', 'Bapak Eko Maulana', '081234567806', 'active', NOW()),
('11111111-1111-1111-1111-111111111107', '2024007', 'Hasan Basri', '1B', 'Asrama Al-Huda', 'Bapak Tono Basri', '081234567807', 'active', NOW()),
('11111111-1111-1111-1111-111111111108', '2024008', 'Ibrahim Malik', '1B', 'Asrama Al-Huda', 'Bapak Budi Malik', '081234567808', 'active', NOW()),
('11111111-1111-1111-1111-111111111109', '2024009', 'Zaid Abdurrahman', '1B', 'Asrama Al-Huda', 'Bapak Joko Abdurrahman', '081234567809', 'active', NOW()),
('11111111-1111-1111-1111-111111111110', '2024010', 'Hamzah Salman', '1B', 'Asrama Al-Huda', 'Bapak Wawan Salman', '081234567810', 'active', NOW()),

-- Kelas 2A (5 santri)
('11111111-1111-1111-1111-111111111111', '2023001', 'Khairul Anwar', '2A', 'Asrama An-Nur', 'Bapak Surya Anwar', '081234567811', 'active', NOW()),
('11111111-1111-1111-1111-111111111112', '2023002', 'Faisal Akbar', '2A', 'Asrama An-Nur', 'Bapak Rudi Akbar', '081234567812', 'active', NOW()),
('11111111-1111-1111-1111-111111111113', '2023003', 'Naufal Zhafran', '2A', 'Asrama An-Nur', 'Bapak Bambang Zhafran', '081234567813', 'active', NOW()),
('11111111-1111-1111-1111-111111111114', '2023004', 'Raffi Azzam', '2A', 'Asrama An-Nur', 'Bapak Hendra Azzam', '081234567814', 'active', NOW()),
('11111111-1111-1111-1111-111111111115', '2023005', 'Dzaky Firmansyah', '2A', 'Asrama An-Nur', 'Bapak Agus Firmansyah', '081234567815', 'active', NOW()),

-- Kelas 2B (5 santri)
('11111111-1111-1111-1111-111111111116', '2023006', 'Alif Murtadho', '2B', 'Asrama Ar-Rahman', 'Bapak Slamet Murtadho', '081234567816', 'active', NOW()),
('11111111-1111-1111-1111-111111111117', '2023007', 'Farhan Maulidy', '2B', 'Asrama Ar-Rahman', 'Bapak Udin Maulidy', '081234567817', 'active', NOW()),
('11111111-1111-1111-1111-111111111118', '2023008', 'Ghofar Habibi', '2B', 'Asrama Ar-Rahman', 'Bapak Fajar Habibi', '081234567818', 'active', NOW()),
('11111111-1111-1111-1111-111111111119', '2023009', 'Ilham Syahputra', '2B', 'Asrama Ar-Rahman', 'Bapak Darmawan Syahputra', '081234567819', 'active', NOW()),
('11111111-1111-1111-1111-111111111120', '2023010', 'Jihan Mufid', '2B', 'Asrama Ar-Rahman', 'Bapak Yanto Mufid', '081234567820', 'inactive', NOW());


-- ============================================
-- 2. DATA PEMBAYARAN SYAHRIAH
-- ============================================

-- Pembayaran untuk Ahmad Fauzi Rahman (lunas semua)
INSERT INTO payments (santri_id, amount, payment_date, month, year, status, notes) VALUES
('11111111-1111-1111-1111-111111111101', 500000, '2024-09-05', 9, 2024, 'paid', 'Pembayaran tepat waktu'),
('11111111-1111-1111-1111-111111111101', 500000, '2024-10-03', 10, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111101', 500000, '2024-11-02', 11, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111101', 500000, '2024-12-05', 12, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111101', 500000, '2025-01-08', 1, 2025, 'paid', NULL),
('11111111-1111-1111-1111-111111111101', 500000, '2025-02-03', 2, 2025, 'paid', 'Pembayaran awal bulan');

-- Pembayaran untuk Muhammad Rizki (ada yang belum lunas)
INSERT INTO payments (santri_id, amount, payment_date, month, year, status, notes) VALUES
('11111111-1111-1111-1111-111111111102', 500000, '2024-09-10', 9, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111102', 500000, '2024-10-15', 10, 2024, 'paid', 'Terlambat 15 hari'),
('11111111-1111-1111-1111-111111111102', 250000, '2024-11-20', 11, 2024, 'partial', 'Dicicil, sisa 250rb'),
('11111111-1111-1111-1111-111111111102', 500000, '2025-01-05', 1, 2025, 'paid', NULL);

-- Pembayaran untuk Abdullah Hakim
INSERT INTO payments (santri_id, amount, payment_date, month, year, status, notes) VALUES
('11111111-1111-1111-1111-111111111103', 500000, '2024-09-05', 9, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111103', 500000, '2024-10-05', 10, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111103', 500000, '2024-11-05', 11, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111103', 500000, '2024-12-05', 12, 2024, 'paid', NULL);

-- Pembayaran untuk Umar Faruq (beberapa bulan partial)
INSERT INTO payments (santri_id, amount, payment_date, month, year, status, notes) VALUES
('11111111-1111-1111-1111-111111111104', 500000, '2024-09-08', 9, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111104', 300000, '2024-10-20', 10, 2024, 'partial', 'Dicicil dulu'),
('11111111-1111-1111-1111-111111111104', 300000, '2024-11-25', 11, 2024, 'partial', 'Masih kesulitan ekonomi');

-- Pembayaran untuk Khairul Anwar (kelas 2A)
INSERT INTO payments (santri_id, amount, payment_date, month, year, status, notes) VALUES
('11111111-1111-1111-1111-111111111111', 500000, '2024-09-02', 9, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111111', 500000, '2024-10-02', 10, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111111', 500000, '2024-11-02', 11, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111111', 500000, '2024-12-02', 12, 2024, 'paid', NULL),
('11111111-1111-1111-1111-111111111111', 500000, '2025-01-02', 1, 2025, 'paid', NULL),
('11111111-1111-1111-1111-111111111111', 500000, '2025-02-02', 2, 2025, 'paid', 'Selalu tepat waktu');

-- Pembayaran untuk beberapa santri lainnya (Februari 2025)
INSERT INTO payments (santri_id, amount, payment_date, month, year, status, notes) VALUES
('11111111-1111-1111-1111-111111111105', 500000, '2025-02-05', 2, 2025, 'paid', NULL),
('11111111-1111-1111-1111-111111111106', 500000, '2025-02-03', 2, 2025, 'paid', NULL),
('11111111-1111-1111-1111-111111111107', 250000, '2025-02-08', 2, 2025, 'partial', 'Bayar setengah dulu'),
('11111111-1111-1111-1111-111111111112', 500000, '2025-02-01', 2, 2025, 'paid', NULL),
('11111111-1111-1111-1111-111111111113', 500000, '2025-02-04', 2, 2025, 'paid', NULL);


-- ============================================
-- 3. DATA PERIZINAN
-- ============================================

-- Izin yang sudah disetujui
INSERT INTO permissions (santri_id, type, start_date, end_date, reason, status, created_at) VALUES
('11111111-1111-1111-1111-111111111101', 'sick', '2025-01-15', '2025-01-17', 'Demam tinggi, perlu istirahat di rumah', 'approved', '2025-01-14 08:00:00'),
('11111111-1111-1111-1111-111111111102', 'permit', '2025-01-20', '2025-01-22', 'Menghadiri pernikahan kakak', 'approved', '2025-01-18 10:00:00'),
('11111111-1111-1111-1111-111111111103', 'sick', '2025-02-01', '2025-02-03', 'Sakit perut, harus ke rumah sakit', 'approved', '2025-01-31 14:00:00'),
('11111111-1111-1111-1111-111111111111', 'permit', '2025-01-25', '2025-01-27', 'Acara keluarga besar', 'approved', '2025-01-23 09:00:00'),
('11111111-1111-1111-1111-111111111112', 'sick', '2025-02-05', '2025-02-06', 'Flu berat', 'approved', '2025-02-04 07:30:00');

-- Izin yang sedang berlangsung hari ini (untuk testing "Santri Sedang Izin")
INSERT INTO permissions (santri_id, type, start_date, end_date, reason, status, created_at) VALUES
('11111111-1111-1111-1111-111111111104', 'permit', '2025-02-08', '2025-02-10', 'Menjenguk nenek yang sakit', 'approved', '2025-02-07 10:00:00'),
('11111111-1111-1111-1111-111111111105', 'sick', '2025-02-09', '2025-02-11', 'Demam dan batuk', 'approved', '2025-02-08 16:00:00');

-- Izin yang ditolak
INSERT INTO permissions (santri_id, type, start_date, end_date, reason, status, created_at) VALUES
('11111111-1111-1111-1111-111111111106', 'permit', '2025-02-01', '2025-02-05', 'Ingin liburan ke rumah', 'rejected', '2025-01-28 11:00:00'),
('11111111-1111-1111-1111-111111111107', 'other', '2025-01-28', '2025-01-30', 'Alasan tidak jelas', 'rejected', '2025-01-26 15:00:00');

-- Izin yang masih pending (menunggu approval)
INSERT INTO permissions (santri_id, type, start_date, end_date, reason, status, created_at) VALUES
('11111111-1111-1111-1111-111111111108', 'permit', '2025-02-12', '2025-02-14', 'Menghadiri wisuda kakak', 'pending', '2025-02-08 09:00:00'),
('11111111-1111-1111-1111-111111111109', 'sick', '2025-02-10', '2025-02-11', 'Sakit gigi, perlu ke dokter', 'pending', '2025-02-09 08:00:00'),
('11111111-1111-1111-1111-111111111110', 'permit', '2025-02-15', '2025-02-17', 'Acara khitanan adik', 'pending', '2025-02-09 10:30:00'),
('11111111-1111-1111-1111-111111111113', 'late', '2025-02-09', '2025-02-09', 'Telat bangun karena begadang belajar', 'pending', '2025-02-09 07:15:00'),
('11111111-1111-1111-1111-111111111114', 'permit', '2025-02-20', '2025-02-22', 'Pulang kampung untuk urusan keluarga', 'pending', '2025-02-09 11:00:00');

-- Riwayat izin tahun lalu untuk beberapa santri
INSERT INTO permissions (santri_id, type, start_date, end_date, reason, status, created_at) VALUES
('11111111-1111-1111-1111-111111111101', 'permit', '2024-11-10', '2024-11-12', 'Menghadiri acara keluarga', 'approved', '2024-11-08 10:00:00'),
('11111111-1111-1111-1111-111111111101', 'sick', '2024-12-05', '2024-12-07', 'Demam dan flu', 'approved', '2024-12-04 08:00:00'),
('11111111-1111-1111-1111-111111111102', 'late', '2024-10-15', '2024-10-15', 'Terlambat karena hujan deras', 'approved', '2024-10-15 07:30:00'),
('11111111-1111-1111-1111-111111111111', 'sick', '2024-09-20', '2024-09-22', 'Sakit perut', 'approved', '2024-09-19 14:00:00');


-- ============================================
-- 4. DATA NILAI AKADEMIK
-- ============================================

-- Nilai untuk Ahmad Fauzi Rahman (Kelas 1A) - Semester Ganjil 2024/2025
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111101', 'Al-Quran', 'Ganjil', '2024/2025', '88', 'Hafalan lancar'),
('11111111-1111-1111-1111-111111111101', 'Tajwid', 'Ganjil', '2024/2025', '85', NULL),
('11111111-1111-1111-1111-111111111101', 'Fiqih', 'Ganjil', '2024/2025', '90', 'Sangat baik'),
('11111111-1111-1111-1111-111111111101', 'Hadits', 'Ganjil', '2024/2025', '82', NULL),
('11111111-1111-1111-1111-111111111101', 'Nahwu', 'Ganjil', '2024/2025', '78', 'Perlu ditingkatkan'),
('11111111-1111-1111-1111-111111111101', 'Shorof', 'Ganjil', '2024/2025', '80', NULL),
('11111111-1111-1111-1111-111111111101', 'Aqidah', 'Ganjil', '2024/2025', '87', NULL),
('11111111-1111-1111-1111-111111111101', 'Akhlaq', 'Ganjil', '2024/2025', '92', 'Teladan bagi teman-teman'),
('11111111-1111-1111-1111-111111111101', 'Bahasa Arab', 'Ganjil', '2024/2025', '84', NULL),
('11111111-1111-1111-1111-111111111101', 'Bahasa Indonesia', 'Ganjil', '2024/2025', '86', NULL);

-- Nilai untuk Muhammad Rizki (Kelas 1A) - Semester Ganjil 2024/2025
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111102', 'Al-Quran', 'Ganjil', '2024/2025', '75', 'Perlu lebih rajin murojaah'),
('11111111-1111-1111-1111-111111111102', 'Tajwid', 'Ganjil', '2024/2025', '72', NULL),
('11111111-1111-1111-1111-111111111102', 'Fiqih', 'Ganjil', '2024/2025', '78', NULL),
('11111111-1111-1111-1111-111111111102', 'Hadits', 'Ganjil', '2024/2025', '70', 'Hafalan hadits kurang lancar'),
('11111111-1111-1111-1111-111111111102', 'Nahwu', 'Ganjil', '2024/2025', '65', 'Perlu bimbingan tambahan'),
('11111111-1111-1111-1111-111111111102', 'Shorof', 'Ganjil', '2024/2025', '68', NULL),
('11111111-1111-1111-1111-111111111102', 'Aqidah', 'Ganjil', '2024/2025', '80', NULL),
('11111111-1111-1111-1111-111111111102', 'Akhlaq', 'Ganjil', '2024/2025', '85', 'Sopan dan baik'),
('11111111-1111-1111-1111-111111111102', 'Bahasa Arab', 'Ganjil', '2024/2025', '70', NULL),
('11111111-1111-1111-1111-111111111102', 'Bahasa Indonesia', 'Ganjil', '2024/2025', '82', NULL);

-- Nilai untuk Abdullah Hakim (Kelas 1A) - Semester Ganjil 2024/2025
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111103', 'Al-Quran', 'Ganjil', '2024/2025', '92', 'Hafidz Quran juz 1-5'),
('11111111-1111-1111-1111-111111111103', 'Tajwid', 'Ganjil', '2024/2025', '95', 'Tajwid sempurna'),
('11111111-1111-1111-1111-111111111103', 'Fiqih', 'Ganjil', '2024/2025', '88', NULL),
('11111111-1111-1111-1111-111111111103', 'Hadits', 'Ganjil', '2024/2025', '90', NULL),
('11111111-1111-1111-1111-111111111103', 'Nahwu', 'Ganjil', '2024/2025', '85', NULL),
('11111111-1111-1111-1111-111111111103', 'Shorof', 'Ganjil', '2024/2025', '87', NULL);

-- Nilai untuk Khairul Anwar (Kelas 2A) - Semester Ganjil 2024/2025
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'Al-Quran', 'Ganjil', '2024/2025', '85', NULL),
('11111111-1111-1111-1111-111111111111', 'Tajwid', 'Ganjil', '2024/2025', '88', NULL),
('11111111-1111-1111-1111-111111111111', 'Tafsir', 'Ganjil', '2024/2025', '82', NULL),
('11111111-1111-1111-1111-111111111111', 'Fiqih', 'Ganjil', '2024/2025', '86', NULL),
('11111111-1111-1111-1111-111111111111', 'Ushul Fiqih', 'Ganjil', '2024/2025', '80', NULL),
('11111111-1111-1111-1111-111111111111', 'Hadits', 'Ganjil', '2024/2025', '84', NULL),
('11111111-1111-1111-1111-111111111111', 'Nahwu', 'Ganjil', '2024/2025', '90', 'Penguasaan nahwu sangat baik'),
('11111111-1111-1111-1111-111111111111', 'Shorof', 'Ganjil', '2024/2025', '88', NULL),
('11111111-1111-1111-1111-111111111111', 'Balaghah', 'Ganjil', '2024/2025', '78', NULL),
('11111111-1111-1111-1111-111111111111', 'Bahasa Arab', 'Ganjil', '2024/2025', '92', 'Lancar berbicara Arab');

-- Nilai untuk Khairul Anwar (Kelas 2A) - Semester Genap 2023/2024 (tahun lalu)
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111111', 'Al-Quran', 'Genap', '2023/2024', '82', NULL),
('11111111-1111-1111-1111-111111111111', 'Tajwid', 'Genap', '2023/2024', '85', NULL),
('11111111-1111-1111-1111-111111111111', 'Fiqih', 'Genap', '2023/2024', '80', NULL),
('11111111-1111-1111-1111-111111111111', 'Hadits', 'Genap', '2023/2024', '78', NULL),
('11111111-1111-1111-1111-111111111111', 'Nahwu', 'Genap', '2023/2024', '88', NULL),
('11111111-1111-1111-1111-111111111111', 'Shorof', 'Genap', '2023/2024', '85', NULL);

-- Nilai untuk Faisal Akbar (Kelas 2A)
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111112', 'Al-Quran', 'Ganjil', '2024/2025', '78', NULL),
('11111111-1111-1111-1111-111111111112', 'Tajwid', 'Ganjil', '2024/2025', '80', NULL),
('11111111-1111-1111-1111-111111111112', 'Fiqih', 'Ganjil', '2024/2025', '75', NULL),
('11111111-1111-1111-1111-111111111112', 'Hadits', 'Ganjil', '2024/2025', '72', NULL),
('11111111-1111-1111-1111-111111111112', 'Nahwu', 'Ganjil', '2024/2025', '70', 'Perlu latihan lebih'),
('11111111-1111-1111-1111-111111111112', 'Shorof', 'Ganjil', '2024/2025', '68', NULL);

-- Nilai untuk Yusuf Maulana (Kelas 1B)
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111106', 'Al-Quran', 'Ganjil', '2024/2025', '80', NULL),
('11111111-1111-1111-1111-111111111106', 'Tajwid', 'Ganjil', '2024/2025', '82', NULL),
('11111111-1111-1111-1111-111111111106', 'Fiqih', 'Ganjil', '2024/2025', '85', NULL),
('11111111-1111-1111-1111-111111111106', 'Hadits', 'Ganjil', '2024/2025', '78', NULL),
('11111111-1111-1111-1111-111111111106', 'Nahwu', 'Ganjil', '2024/2025', '75', NULL),
('11111111-1111-1111-1111-111111111106', 'Shorof', 'Ganjil', '2024/2025', '77', NULL),
('11111111-1111-1111-1111-111111111106', 'Aqidah', 'Ganjil', '2024/2025', '88', NULL),
('11111111-1111-1111-1111-111111111106', 'Akhlaq', 'Ganjil', '2024/2025', '90', 'Santri teladan');

-- Nilai untuk beberapa santri lain (minimal data)
INSERT INTO grades (santri_id, subject, semester, academic_year, grade, notes) VALUES
('11111111-1111-1111-1111-111111111107', 'Al-Quran', 'Ganjil', '2024/2025', '70', NULL),
('11111111-1111-1111-1111-111111111107', 'Fiqih', 'Ganjil', '2024/2025', '72', NULL),
('11111111-1111-1111-1111-111111111108', 'Al-Quran', 'Ganjil', '2024/2025', '85', NULL),
('11111111-1111-1111-1111-111111111108', 'Fiqih', 'Ganjil', '2024/2025', '88', NULL),
('11111111-1111-1111-1111-111111111109', 'Al-Quran', 'Ganjil', '2024/2025', '75', NULL),
('11111111-1111-1111-1111-111111111110', 'Al-Quran', 'Ganjil', '2024/2025', '78', NULL),
('11111111-1111-1111-1111-111111111113', 'Al-Quran', 'Ganjil', '2024/2025', '82', NULL),
('11111111-1111-1111-1111-111111111113', 'Tajwid', 'Ganjil', '2024/2025', '85', NULL),
('11111111-1111-1111-1111-111111111113', 'Fiqih', 'Ganjil', '2024/2025', '80', NULL),
('11111111-1111-1111-1111-111111111114', 'Al-Quran', 'Ganjil', '2024/2025', '88', NULL),
('11111111-1111-1111-1111-111111111114', 'Tajwid', 'Ganjil', '2024/2025', '90', NULL);


-- ============================================
-- RINGKASAN DATA
-- ============================================
-- 20 Santri (4 kelas: 1A, 1B, 2A, 2B)
-- ~30 Pembayaran (berbagai status: paid, partial)
-- ~20 Perizinan (pending, approved, rejected)
-- ~70 Nilai (berbagai mapel dan semester)
-- ============================================

SELECT 'Dummy data berhasil ditambahkan!' as status;
SELECT 'Santri: ' || COUNT(*) as jumlah FROM santri;
SELECT 'Pembayaran: ' || COUNT(*) as jumlah FROM payments;
SELECT 'Perizinan: ' || COUNT(*) as jumlah FROM permissions;
SELECT 'Nilai: ' || COUNT(*) as jumlah FROM grades;
