# Mini Clinic Information System

Sistem Informasi Klinik Mini ini dibuat sebagai bagian dari test case Agile Micro-sprints. Aplikasi ini terdiri dari Backend (Node.js/Express) dan Frontend (React/Vite) dengan database PostgreSQL.

## Fitur Utama & Modul (Sesuai Sprint)

1. **Auth (JWT + RBAC)**: Login dengan Role administrator, dokter, dan petugas_pendaftaran.
2. **Master Data Pasien**: CRUD pasien dengan validasi NIK unik dan generate No RM otomatis.
3. **Pendaftaran Pasien**: Pendaftaran kunjungan ke Poli dan Dokter tertentu.
4. **Antrean**: Generate nomor antrean otomatis per hari per Poli.
5. **Pemeriksaan Dokter (SOAP)**: Input Subjective, Objective, Assessment, Plan (termasuk tindakan medis dan resep obat).
6. **Dashboard**: Ringkasan metrik harian.

## User Uji Coba (Credentials for Testing)

Semua user sampel menggunakan password: **`password123`**

| Role | Email | Password | Nama |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@klinik.local` | `password123` | Administrator Utama |
| **Dokter** | `dokter@klinik.local` | `password123` | Dr. Ayu Rahmawati |
| **Petugas Pendaftaran** | `pendaftaran@klinik.local` | `password123` | Petugas Depan Budi |

## Tech Stack

*   **Backend:** Node.js, Express, TypeScript, `pg` (PostgreSQL), JWT, Bcrypt
*   **Frontend:** React, Vite, TypeScript, Tailwind CSS, React Router DOM, Axios
*   **Database:** PostgreSQL

## Cara Menjalankan

### Persyaratan
*   Node.js (v18+)
*   PostgreSQL
*   Docker & Docker Compose (Opsional, untuk menjalankan DB via container)

### 1. Setup Database
1. Buat database PostgreSQL dengan nama `mini_clinic` (atau gunakan Docker).
2. Jalankan script `backend/schema.sql` pada database tersebut.
3. Seed data sampel (Poli dan 3 Akun User) sudah disertakan secara otomatis di akhir `schema.sql`.

### 2. Setup Backend
1. Masuk ke folder `backend`: `cd backend`
2. Install dependencies: `npm install`
3. Sesuaikan file `.env` dari `.env.example` dengan koneksi DB Anda.
4. Jalankan backend: `npm run dev` (API berjalan di port 3000)

### 3. Setup Frontend
1. Masuk ke folder `frontend`: `cd frontend`
2. Install dependencies: `npm install`
3. Sesuaikan file `.env` dari `.env.example` (VITE_API_URL).
4. Jalankan frontend: `npm run dev` (Aplikasi berjalan di port 5173)

## Asumsi & Batasan (Sesuai Konteks Waktu Mepet)
*   **Styling UI:** Menggunakan komponen Tailwind minimal standar tanpa desain custom ekstensif.
*   **Halaman Detail:** Menggunakan list sederhana tanpa filter kompleks.
*   **Pagination:** Menggunakan limit/offset standar (lihat endpoint `/api/patients`).
*   **Manajemen Poli/Dokter:** Data Poli dan User Dokter di-seed langsung ke database PostgreSQL via `schema.sql`.
