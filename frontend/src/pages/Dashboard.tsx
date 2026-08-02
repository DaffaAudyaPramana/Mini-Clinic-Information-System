import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { Users, UserPlus, Clock, CheckCircle2, Activity, Building2, Calendar, ChevronRight, Stethoscope, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Metrics {
  total_patients: number;
  today_registrations: number;
  today_completed: number;
  poli_stats: { name: string; count: number }[];
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<Metrics>({
    total_patients: 0,
    today_registrations: 0,
    today_completed: 0,
    poli_stats: []
  });
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.get(`${apiUrl}/api/dashboard/metrics`);
      if (response.data.success) {
        setMetrics(response.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/60 via-indigo-900/40 to-slate-900 border border-blue-500/20 p-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-400 text-xs font-semibold mb-3">
              <Activity className="w-3.5 h-3.5" /> Live Clinic Operational Dashboard
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang, {user?.name || 'User'}!
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Sistem Informasi Klinik Mini — PT Inova Medika Solusindo.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={fetchMetrics}
              className="p-3 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 rounded-2xl text-sm font-medium transition-all flex items-center gap-2"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <Link
              to="/patients"
              className="px-5 py-3 bg-gradient-to-r from-blue-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white rounded-2xl font-semibold text-sm shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Master Pasien</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Total Patients */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Pasien Terdaftar</span>
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl text-blue-400 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {loading ? '...' : metrics.total_patients}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Pasien dalam Rekam Medis</span>
          </div>
        </div>

        {/* Card 2: Today Registrations */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Kunjungan Hari Ini</span>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-400 group-hover:scale-110 transition-transform">
              <Calendar className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {loading ? '...' : metrics.today_registrations}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Registrasi Pasien Masuk</span>
          </div>
        </div>

        {/* Card 3: Today Completed */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-emerald-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pemeriksaan Selesai</span>
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {loading ? '...' : metrics.today_completed}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Selesai Diperiksa Dokter</span>
          </div>
        </div>

        {/* Card 4: Antrean Menunggu */}
        <div className="glass-card p-6 rounded-3xl relative overflow-hidden group hover:border-purple-500/40 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Dalam Antrean</span>
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-2xl text-purple-400 group-hover:scale-110 transition-transform">
              <Clock className="w-6 h-6" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-white tracking-tight">
              {loading ? '...' : Math.max(0, metrics.today_registrations - metrics.today_completed)}
            </span>
            <span className="text-xs text-slate-400 block mt-1">Menunggu / Sedang Diperiksa</span>
          </div>
        </div>
      </div>

      {/* Middle Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Poli Distribution Widget */}
        <div className="lg:col-span-2 glass-panel p-6 rounded-3xl space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-400" /> Distribusi Kunjungan per Poli
              </h2>
              <p className="text-xs text-slate-400">Ringkasan pasien terdaftar di masing-masing Poliklinik hari ini</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.poli_stats.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
                Belum ada data kunjungan Poli hari ini.
              </div>
            ) : (
              metrics.poli_stats.map((poli, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold">
                      {poli.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">{poli.name}</h4>
                      <span className="text-xs text-slate-400">Pemeriksaan Dokter</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-white">{poli.count}</span>
                    <span className="text-[10px] text-slate-400 block">pasien</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Nav Actions */}
        <div className="glass-panel p-6 rounded-3xl space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-teal-400" /> Modul Sistem
          </h2>
          <p className="text-xs text-slate-400">Akses cepat sesuai hak akses role Anda</p>

          <div className="space-y-3 pt-2">
            <Link
              to="/patients"
              className="w-full p-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl flex items-center justify-between group transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">Master Pasien</h4>
                  <p className="text-xs text-slate-400">Kelola database pasien & NIK</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:translate-x-1 group-hover:text-blue-400 transition-all" />
            </Link>

            <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-300">Sistem Antrean & SOAP</h4>
                  <p className="text-xs text-slate-500">Otomatis via API Backend</p>
                </div>
              </div>
              <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/30">Active API</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
