-- =====================================================================
-- Mini Clinic Information System - Database Schema (PostgreSQL)
-- =====================================================================
-- Catatan:
-- - Menggunakan UUID sebagai primary key (gunakan extension pgcrypto
--   atau uuid-ossp; contoh di bawah pakai gen_random_uuid() dari pgcrypto)
-- - Semua tabel punya created_at & updated_at untuk audit sederhana
-- - Dua tabel counter (no_rm_counters, queue_counters) adalah tabel
--   utilitas untuk generate nomor secara atomic (concurrency-safe)
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =====================================================================
-- ENUM TYPES
-- =====================================================================
CREATE TYPE user_role_enum AS ENUM ('administrator', 'dokter', 'petugas_pendaftaran');
CREATE TYPE gender_enum AS ENUM ('L', 'P');
CREATE TYPE payment_type_enum AS ENUM ('umum', 'bpjs', 'asuransi');
CREATE TYPE visit_status_enum AS ENUM ('menunggu', 'check_in', 'pemeriksaan', 'selesai');
CREATE TYPE queue_status_enum AS ENUM ('menunggu', 'dipanggil', 'diperiksa', 'selesai');

-- =====================================================================
-- 1. USERS
-- =====================================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role user_role_enum NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 2. POLI (poliklinik)
-- =====================================================================
CREATE TABLE poli (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(10) NOT NULL UNIQUE,
    queue_prefix CHAR(1) NOT NULL DEFAULT 'A',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 3. DOCTORS (profil tambahan untuk user dengan role dokter)
-- =====================================================================
CREATE TABLE doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    poli_id UUID NOT NULL REFERENCES poli(id) ON DELETE RESTRICT,
    specialization VARCHAR(100),
    sip_number VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_doctors_poli_id ON doctors(poli_id);

-- =====================================================================
-- 4. PATIENTS
-- =====================================================================
CREATE TABLE patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    no_rm VARCHAR(20) NOT NULL UNIQUE,
    nik VARCHAR(16) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    gender gender_enum NOT NULL,
    birth_date DATE NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_patients_name ON patients(name);
CREATE INDEX idx_patients_nik ON patients(nik);

-- =====================================================================
-- 5. NO_RM_COUNTERS (utilitas: generate No. RM atomic per periode)
-- =====================================================================
CREATE TABLE no_rm_counters (
    period VARCHAR(6) PRIMARY KEY, -- format YYYYMM
    last_number INT NOT NULL DEFAULT 0
);

CREATE OR REPLACE FUNCTION generate_no_rm() RETURNS VARCHAR AS $$
DECLARE
    v_period VARCHAR := to_char(CURRENT_DATE, 'YYYYMM');
    v_next INT;
BEGIN
    INSERT INTO no_rm_counters (period, last_number)
    VALUES (v_period, 1)
    ON CONFLICT (period) DO UPDATE SET last_number = no_rm_counters.last_number + 1
    RETURNING last_number INTO v_next;

    RETURN 'RM-' || v_period || '-' || LPAD(v_next::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 6. REGISTRATIONS (pendaftaran / kunjungan pasien)
-- =====================================================================
CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
    poli_id UUID NOT NULL REFERENCES poli(id) ON DELETE RESTRICT,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    payment_type payment_type_enum NOT NULL,
    complaint TEXT,
    status visit_status_enum NOT NULL DEFAULT 'menunggu',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_registrations_patient_id ON registrations(patient_id);
CREATE INDEX idx_registrations_doctor_id ON registrations(doctor_id);
CREATE INDEX idx_registrations_visit_date ON registrations(visit_date);
CREATE INDEX idx_registrations_status ON registrations(status);

-- =====================================================================
-- 7. QUEUE_COUNTERS (utilitas: generate nomor antrean atomic per hari+poli)
-- =====================================================================
CREATE TABLE queue_counters (
    queue_date DATE NOT NULL,
    poli_id UUID NOT NULL REFERENCES poli(id) ON DELETE CASCADE,
    last_number INT NOT NULL DEFAULT 0,
    PRIMARY KEY (queue_date, poli_id)
);

CREATE OR REPLACE FUNCTION generate_queue_number(p_poli_id UUID) RETURNS VARCHAR AS $$
DECLARE
    v_prefix CHAR(1);
    v_next INT;
BEGIN
    SELECT queue_prefix INTO v_prefix FROM poli WHERE id = p_poli_id;

    INSERT INTO queue_counters (queue_date, poli_id, last_number)
    VALUES (CURRENT_DATE, p_poli_id, 1)
    ON CONFLICT (queue_date, poli_id) DO UPDATE SET last_number = queue_counters.last_number + 1
    RETURNING last_number INTO v_next;

    RETURN v_prefix || LPAD(v_next::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- =====================================================================
-- 8. QUEUES
-- =====================================================================
CREATE TABLE queues (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    queue_number VARCHAR(10) NOT NULL,
    queue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    status queue_status_enum NOT NULL DEFAULT 'menunggu',
    called_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_queues_queue_date ON queues(queue_date);
CREATE INDEX idx_queues_status ON queues(status);

-- =====================================================================
-- 9. MEDICAL_RECORDS (SOAP)
-- =====================================================================
CREATE TABLE medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL UNIQUE REFERENCES registrations(id) ON DELETE CASCADE,
    -- Subjective
    subjective TEXT,
    -- Objective
    blood_pressure VARCHAR(20),
    temperature NUMERIC(4,1),
    weight NUMERIC(5,2),
    height NUMERIC(5,2),
    -- Assessment
    diagnosis TEXT,
    -- Plan
    treatment_plan TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- 10. MEDICAL_ACTIONS (tindakan medis, bisa lebih dari satu per kunjungan)
-- =====================================================================
CREATE TABLE medical_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    action_name VARCHAR(150) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_medical_actions_record_id ON medical_actions(medical_record_id);

-- =====================================================================
-- 11. PRESCRIPTIONS
-- =====================================================================
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    medical_record_id UUID NOT NULL REFERENCES medical_records(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_prescriptions_record_id ON prescriptions(medical_record_id);

-- =====================================================================
-- 12. PRESCRIPTION_ITEMS
-- =====================================================================
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(150) NOT NULL,
    dosage VARCHAR(50),
    quantity INT NOT NULL DEFAULT 1,
    instructions TEXT
);

CREATE INDEX idx_prescription_items_prescription_id ON prescription_items(prescription_id);

-- =====================================================================
-- TRIGGER: auto-update updated_at
-- =====================================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_poli_updated_at BEFORE UPDATE ON poli FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_patients_updated_at BEFORE UPDATE ON patients FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_registrations_updated_at BEFORE UPDATE ON registrations FOR EACH ROW EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_queues_updated_at BEFORE UPDATE ON queues FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();
