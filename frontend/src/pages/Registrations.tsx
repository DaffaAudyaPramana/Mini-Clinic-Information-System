import { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Stethoscope, Building2, Ticket, CheckCircle2, Clock, Volume2 } from 'lucide-react';

interface Registration {
  id: string;
  patient_name: string;
  no_rm: string;
  poli_name: string;
  doctor_name: string;
  specialization: string;
  payment_type: string;
  complaint: string;
  status: string;
  visit_date: string;
  queue_number?: string;
  queue_id?: string;
  queue_status?: string;
}

export const Registrations = () => {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/registrations`);
      if (response.data.success) {
        setRegistrations(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch registrations', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const handleUpdateQueueStatus = async (queueId: string, newStatus: string) => {
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.put(`${apiUrl}/api/queues/${queueId}/status`, { status: newStatus });
      if (response.data.success) {
        fetchRegistrations();
      }
    } catch (err: any) {
      alert(err.response?.data?.error || 'Gagal mengupdate status antrean');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'menunggu':
        return <span className="px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full text-xs font-semibold flex items-center gap-1"><Clock className="w-3 h-3" /> Menunggu</span>;
      case 'dipanggil':
        return <span className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-xs font-semibold flex items-center gap-1"><Volume2 className="w-3 h-3 animate-pulse" /> Dipanggil</span>;
      case 'diperiksa':
        return <span className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/30 text-purple-400 rounded-full text-xs font-semibold flex items-center gap-1"><Stethoscope className="w-3 h-3" /> Diperiksa Dokter</span>;
      case 'selesai':
        return <span className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full text-xs font-semibold flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Selesai</span>;
      default:
        return <span className="px-2.5 py-1 bg-slate-500/10 border border-slate-500/30 text-slate-400 rounded-full text-xs font-semibold">{status}</span>;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Ticket className="w-7 h-7 text-teal-400" /> Modul Pendaftaran & Antrean Klinik
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Daftar pendaftaran pasien, alokasi Poliklinik & Dokter, serta nomor antrean aktif hari ini.
        </p>
      </div>

      {/* Registrations & Queue Table */}
      <div className="glass-panel rounded-3xl overflow-hidden shadow-xl border border-slate-800">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                <th className="px-6 py-4">No. Antrean</th>
                <th className="px-6 py-4">Pasien (No. RM)</th>
                <th className="px-6 py-4">Poli & Dokter Tujuan</th>
                <th className="px-6 py-4">Metode Bayar</th>
                <th className="px-6 py-4">Status Antrean</th>
                <th className="px-6 py-4 text-right">Aksi Panggil/Proses</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Memuat data pendaftaran...
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data pendaftaran kunjungan hari ini. Silakan daftarkan pasien melalui menu Master Pasien.
                  </td>
                </tr>
              ) : (
                registrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4">
                      <span className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-teal-500 text-white font-mono font-extrabold rounded-xl text-base shadow-md shadow-blue-500/20">
                        {reg.queue_number || '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-white flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-blue-400" /> {reg.patient_name}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                        {reg.no_rm}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-teal-300 flex items-center gap-1 text-xs">
                        <Building2 className="w-3.5 h-3.5 text-teal-400" /> {reg.poli_name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <Stethoscope className="w-3.5 h-3.5 text-slate-500" /> {reg.doctor_name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-xs uppercase font-bold">
                        {reg.payment_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(reg.queue_status || reg.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {reg.queue_id && (
                        <div className="flex items-center justify-end gap-2">
                          {(reg.queue_status === 'menunggu' || !reg.queue_status) && (
                            <button
                              onClick={() => handleUpdateQueueStatus(reg.queue_id!, 'dipanggil')}
                              className="px-3 py-1.5 bg-blue-600/90 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1"
                            >
                              <Volume2 className="w-3.5 h-3.5" /> Panggil
                            </button>
                          )}
                          {reg.queue_status === 'dipanggil' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(reg.queue_id!, 'diperiksa')}
                              className="px-3 py-1.5 bg-purple-600/90 hover:bg-purple-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1"
                            >
                              <Stethoscope className="w-3.5 h-3.5" /> Diperiksa
                            </button>
                          )}
                          {reg.queue_status === 'diperiksa' && (
                            <button
                              onClick={() => handleUpdateQueueStatus(reg.queue_id!, 'selesai')}
                              className="px-3 py-1.5 bg-emerald-600/90 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" /> Selesai
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
