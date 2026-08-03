import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, UserPlus, Trash2, X, FileText, Phone, MapPin, Calendar, CreditCard, AlertCircle, Ticket, CheckCircle2 } from 'lucide-react';

interface Patient {
  id: string;
  no_rm: string;
  nik: string;
  name: string;
  gender: 'L' | 'P';
  birth_date: string;
  phone: string;
  address: string;
  created_at: string;
}

interface Poli {
  id: string;
  name: string;
  code: string;
}

interface Doctor {
  id: string;
  poli_id: string;
  specialization: string;
  doctor_name: string;
}

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Modal Create Patient State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalError, setModalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Modal Register Poli & Queue State
  const [selectedPatientForReg, setSelectedPatientForReg] = useState<Patient | null>(null);
  const [poliList, setPoliList] = useState<Poli[]>([]);
  const [doctorList, setDoctorList] = useState<Doctor[]>([]);
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([]);
  const [regFormData, setRegFormData] = useState({
    poli_id: '',
    doctor_id: '',
    payment_type: 'umum',
    complaint: ''
  });
  const [regSuccessQueue, setRegSuccessQueue] = useState<string | null>(null);
  const [regError, setRegError] = useState('');
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Form State Pasien Baru
  const [formData, setFormData] = useState({
    nik: '',
    name: '',
    gender: 'L' as 'L' | 'P',
    birth_date: '',
    phone: '',
    address: ''
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/patients`, {
        params: { search, page, limit: 10 }
      });
      if (response.data.success) {
        setPatients(response.data.data.patients);
        setTotalPages(response.data.data.pagination.totalPages);
        setTotalCount(response.data.data.pagination.total);
      }
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOptions = async () => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/registrations/options`);
      if (response.data.success) {
        setPoliList(response.data.data.poli);
        setDoctorList(response.data.data.doctors);
      }
    } catch (err) {
      console.error('Failed to fetch options', err);
    }
  };

  useEffect(() => {
    fetchPatients();
    fetchOptions();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchPatients();
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalError('');

    if (formData.nik.length !== 16) {
      setModalError('NIK harus terdiri dari 16 digit angka');
      return;
    }

    setSubmitting(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/patients`, formData);
      if (response.data.success) {
        setIsModalOpen(false);
        setFormData({ nik: '', name: '', gender: 'L', birth_date: '', phone: '', address: '' });
        fetchPatients();
      }
    } catch (err: any) {
      setModalError(err.response?.data?.error || 'Gagal menambahkan pasien.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePatient = async (id: string, name: string) => {
    if (!window.confirm(`Apakah Anda yakin ingin menghapus pasien ${name}?`)) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.delete(`${apiUrl}/api/patients/${id}`);
      if (response.data.success) {
        fetchPatients();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal menghapus pasien.');
    }
  };

  const handleOpenRegistrationModal = (patient: Patient) => {
    setSelectedPatientForReg(patient);
    setRegSuccessQueue(null);
    setRegError('');
    const defaultPoli = poliList[0]?.id || '';
    setRegFormData({
      poli_id: defaultPoli,
      doctor_id: '',
      payment_type: 'umum',
      complaint: ''
    });

    if (defaultPoli) {
      const docs = doctorList.filter(d => d.poli_id === defaultPoli);
      setFilteredDoctors(docs);
      if (docs.length > 0) {
        setRegFormData(prev => ({ ...prev, poli_id: defaultPoli, doctor_id: docs[0].id }));
      }
    }
  };

  const handlePoliChange = (poliId: string) => {
    const docs = doctorList.filter(d => d.poli_id === poliId);
    setFilteredDoctors(docs);
    setRegFormData(prev => ({
      ...prev,
      poli_id: poliId,
      doctor_id: docs.length > 0 ? docs[0].id : ''
    }));
  };

  const handleProcessRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientForReg) return;
    setRegError('');
    setRegSubmitting(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const payload = {
        patient_id: selectedPatientForReg.id,
        poli_id: regFormData.poli_id,
        doctor_id: regFormData.doctor_id,
        payment_type: regFormData.payment_type,
        complaint: regFormData.complaint
      };

      const response = await axios.post(`${apiUrl}/api/registrations`, payload);
      if (response.data.success) {
        setRegSuccessQueue(response.data.data.queue_number);
      }
    } catch (err: any) {
      setRegError(err.response?.data?.error || 'Gagal mendaftarkan kunjungan.');
    } finally {
      setRegSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-blue-400" /> Master Data Pasien
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Kelola data pasien terdaftar, nomor rekam medis (No. RM), dan pendaftaran ke Poli.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-blue-500/20 flex items-center gap-2 transition-all self-start md:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah Pasien Baru</span>
        </button>
      </div>

      {/* Search & Stats Bar */}
      <div className="glass-panel p-4 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearch} className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari Nama, NIK, atau No. RM..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>

        <div className="text-xs text-slate-400 flex items-center gap-2 self-end md:self-center">
          <span>Total Pasien:</span>
          <span className="px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold rounded-lg">
            {totalCount} Pasien
          </span>
        </div>
      </div>

      {/* Patients Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">No. RM</th>
                <th className="px-6 py-4">Nama Pasien</th>
                <th className="px-6 py-4">NIK</th>
                <th className="px-6 py-4">L/P</th>
                <th className="px-6 py-4">Kontak & Alamat</th>
                <th className="px-6 py-4 text-right">Aksi & Pendaftaran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Memuat data pasien...</span>
                    </div>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada data pasien yang ditemukan.
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-400">
                      {patient.no_rm}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 border border-slate-700 flex items-center justify-center font-bold text-teal-300 text-sm">
                          {patient.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{patient.name}</div>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-500" />
                            {patient.birth_date ? new Date(patient.birth_date).toLocaleDateString('id-ID') : '-'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-mono text-slate-300 text-xs">
                      <div className="flex items-center gap-1.5">
                        <CreditCard className="w-3.5 h-3.5 text-slate-500" />
                        {patient.nik}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        patient.gender === 'L' 
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' 
                          : 'bg-pink-500/10 text-pink-400 border-pink-500/30'
                      }`}>
                        {patient.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-300">
                          <Phone className="w-3 h-3 text-slate-500" /> {patient.phone || '-'}
                        </div>
                        <div className="flex items-center gap-1 text-slate-400 truncate max-w-xs">
                          <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" /> {patient.address || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenRegistrationModal(patient)}
                          className="px-3 py-1.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-xs shadow-md shadow-teal-500/20 flex items-center gap-1 transition-all"
                        >
                          <Ticket className="w-3.5 h-3.5" />
                          <span>Daftar Poli</span>
                        </button>
                        <button
                          onClick={() => handleDeletePatient(patient.id, patient.name)}
                          className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl transition-colors"
                          title="Hapus Pasien"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Halaman <span className="font-semibold text-white">{page}</span> dari <span className="font-semibold text-white">{totalPages || 1}</span>
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs disabled:opacity-40 transition-all"
            >
              Sebelumnya
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 rounded-xl text-xs disabled:opacity-40 transition-all"
            >
              Selanjutnya
            </button>
          </div>
        </div>
      </div>

      {/* Modal Add Patient */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-slate-700 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-400" /> Tambah Pasien Baru
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {modalError && (
              <div className="mt-4 p-3 bg-red-950/60 border border-red-500/50 text-red-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" /> {modalError}
              </div>
            )}

            <form onSubmit={handleCreatePatient} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">NIK (16 Digit)*</label>
                <input
                  type="text"
                  required
                  maxLength={16}
                  placeholder="3271012304950001"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 font-mono"
                  value={formData.nik}
                  onChange={(e) => setFormData({ ...formData, nik: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Nama Lengkap*</label>
                <input
                  type="text"
                  required
                  placeholder="Budi Santoso"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Jenis Kelamin*</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'L' | 'P' })}
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Tanggal Lahir*</label>
                  <input
                    type="date"
                    required
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                    value={formData.birth_date}
                    onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">No. HP / Kontak</label>
                <input
                  type="text"
                  placeholder="081234567890"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Alamat</label>
                <textarea
                  rows={2}
                  placeholder="Jl. Sudirman No. 12, Jakarta"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium">Batal</button>
                <button type="submit" disabled={submitting} className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg">
                  {submitting ? 'Menyimpan...' : 'Simpan Pasien'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Registration to Poli & Queue */}
      {selectedPatientForReg && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl shadow-2xl border border-slate-700 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <Ticket className="w-5 h-5 text-teal-400" /> Pendaftaran Kunjungan Poli
                </h3>
                <p className="text-xs text-slate-400">Pasien: <span className="text-teal-300 font-semibold">{selectedPatientForReg.name}</span> ({selectedPatientForReg.no_rm})</p>
              </div>
              <button onClick={() => setSelectedPatientForReg(null)} className="p-1 text-slate-400 hover:text-white rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {regSuccessQueue ? (
              <div className="mt-6 text-center space-y-4 py-4">
                <div className="inline-flex p-4 bg-emerald-500/20 text-emerald-400 rounded-full border border-emerald-500/30 animate-bounce">
                  <CheckCircle2 className="w-12 h-12" />
                </div>
                <h4 className="text-xl font-bold text-white">Pendaftaran Berhasil!</h4>
                <p className="text-xs text-slate-400">Nomor Antrean Pasien Telah Di-generate Secara Otomatis:</p>
                <div className="inline-block px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-mono text-4xl font-extrabold rounded-2xl shadow-xl shadow-blue-500/30">
                  {regSuccessQueue}
                </div>
                <div className="pt-4">
                  <button
                    onClick={() => setSelectedPatientForReg(null)}
                    className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl text-sm"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleProcessRegistration} className="mt-4 space-y-4">
                {regError && (
                  <div className="p-3 bg-red-950/60 border border-red-500/50 text-red-300 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-400" /> {regError}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Pilih Poliklinik Tujuan*</label>
                  <div className="relative">
                    <select
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                      value={regFormData.poli_id}
                      onChange={(e) => handlePoliChange(e.target.value)}
                    >
                      {poliList.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Pilih Dokter Bertugas*</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                    value={regFormData.doctor_id}
                    onChange={(e) => setRegFormData({ ...regFormData, doctor_id: e.target.value })}
                  >
                    {filteredDoctors.length === 0 ? (
                      <option value="">Tidak ada dokter di poli ini</option>
                    ) : (
                      filteredDoctors.map(d => (
                        <option key={d.id} value={d.id}>{d.doctor_name} ({d.specialization})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Metode Pembayaran*</label>
                  <select
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500"
                    value={regFormData.payment_type}
                    onChange={(e) => setRegFormData({ ...regFormData, payment_type: e.target.value })}
                  >
                    <option value="umum">Umum</option>
                    <option value="bpjs">BPJS Kesehatan</option>
                    <option value="asuransi">Asuransi Swasta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Keluhan / Alasan Kunjungan</label>
                  <textarea
                    rows={2}
                    placeholder="Demam, pusing, batuk sejak 2 hari..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:border-teal-500 text-xs"
                    value={regFormData.complaint}
                    onChange={(e) => setRegFormData({ ...regFormData, complaint: e.target.value })}
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                  <button type="button" onClick={() => setSelectedPatientForReg(null)} className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl text-sm font-medium">Batal</button>
                  <button type="submit" disabled={regSubmitting} className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl text-sm shadow-lg flex items-center gap-2">
                    <Ticket className="w-4 h-4" />
                    {regSubmitting ? 'Memproses...' : 'Proses & Ambil Antrean'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
