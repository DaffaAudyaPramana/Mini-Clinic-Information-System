import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Activity, ShieldCheck, Stethoscope, UserCheck, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setError('');
    setIsLoading(true);

    const loginEmail = customEmail || email;
    const loginPassword = customPassword || password;
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await axios.post(`${apiUrl}/api/auth/login`, { 
        email: loginEmail, 
        password: loginPassword 
      });
      
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Gagal login. Periksa email dan password Anda.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (roleEmail: string) => {
    setEmail(roleEmail);
    setPassword('password123');
    handleSubmit(undefined, roleEmail, 'password123');
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-950 text-slate-100 overflow-hidden px-4">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/30 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative w-full max-w-md z-10">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-2xl shadow-xl shadow-blue-500/20 mb-3 group hover:scale-105 transition-transform duration-300">
            <Activity className="w-10 h-10 text-white stroke-[2.5]" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Mini Clinic System
          </h1>
          <p className="text-sm text-slate-400 mt-1">PT Inova Medika Solusindo</p>
        </div>

        {/* Login Glass Card */}
        <div className="glass-panel p-8 rounded-3xl shadow-2xl shadow-slate-950/80 border border-slate-800">
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            Selamat Datang <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs text-slate-400 mb-6">Silakan masuk menggunakan akun terdaftar Anda.</p>
          
          {error && (
            <div className="bg-red-950/60 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl mb-5 text-sm flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>{error}</div>
            </div>
          )}

          <form onSubmit={(e) => handleSubmit(e)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@klinik.local"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/80 border border-slate-700/80 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-500 hover:from-blue-500 hover:to-teal-400 text-white font-semibold rounded-xl text-sm shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 group transition-all duration-200 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Masuk ke Sistem</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Quick Login Test Accounts Shortcut */}
          <div className="mt-8 pt-6 border-t border-slate-800/80">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
              Direct Quick Login (Uji Coba)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@klinik.local')}
                className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-center flex flex-col items-center gap-1 transition-all group"
              >
                <ShieldCheck className="w-5 h-5 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-slate-300">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('dokter@klinik.local')}
                className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-center flex flex-col items-center gap-1 transition-all group"
              >
                <Stethoscope className="w-5 h-5 text-teal-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-slate-300">Dokter</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('pendaftaran@klinik.local')}
                className="p-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/50 rounded-xl text-center flex flex-col items-center gap-1 transition-all group"
              >
                <UserCheck className="w-5 h-5 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-medium text-slate-300">Petugas</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 text-center mt-2">Default Password: password123</p>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-slate-500 mt-6">
          &copy; {new Date().getFullYear()} PT Inova Medika Solusindo. All rights reserved.
        </p>
      </div>
    </div>
  );
};
