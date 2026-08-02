import React from 'react';
import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { Login } from './pages/Login';
import { Patients } from './pages/Patients';
import { Dashboard } from './pages/Dashboard';
import { useAuth } from './contexts/AuthContext';
import { Activity, LayoutDashboard, Users, LogOut, ShieldCheck, Stethoscope, UserCheck, ChevronRight } from 'lucide-react';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'administrator':
        return { label: 'Admin', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: ShieldCheck };
      case 'dokter':
        return { label: 'Dokter', color: 'bg-teal-500/20 text-teal-300 border-teal-500/30', icon: Stethoscope };
      case 'petugas_pendaftaran':
        return { label: 'Petugas', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: UserCheck };
      default:
        return { label: role || 'User', color: 'bg-slate-500/20 text-slate-300 border-slate-500/30', icon: Activity };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/90 border-r border-slate-800/80 flex flex-col justify-between backdrop-blur-xl">
        <div>
          {/* Logo & Brand */}
          <div className="p-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-teal-400 rounded-xl shadow-md shadow-blue-500/20">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-white tracking-tight leading-none">Mini Clinic</h2>
                <span className="text-[10px] text-slate-400 font-medium">PT Inova Medika Solusindo</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            <Link
              to="/dashboard"
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                location.pathname === '/dashboard'
                  ? 'bg-gradient-to-r from-blue-600/90 to-teal-500/90 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <LayoutDashboard className="w-5 h-5" />
                <span>Dashboard</span>
              </div>
              {location.pathname === '/dashboard' && <ChevronRight className="w-4 h-4 opacity-80" />}
            </Link>

            <Link
              to="/patients"
              className={`flex items-center justify-between px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                location.pathname === '/patients'
                  ? 'bg-gradient-to-r from-blue-600/90 to-teal-500/90 text-white shadow-lg shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5" />
                <span>Master Pasien</span>
              </div>
              {location.pathname === '/patients' && <ChevronRight className="w-4 h-4 opacity-80" />}
            </Link>
          </nav>
        </div>

        {/* User Profile Card at Bottom */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40">
          <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white flex-shrink-0">
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="truncate">
                <h4 className="text-xs font-bold text-white truncate">{user?.name}</h4>
                <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border mt-0.5 ${roleInfo.color}`}>
                  <RoleIcon className="w-3 h-3" />
                  <span>{roleInfo.label}</span>
                </div>
              </div>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-slate-950 min-h-screen">
        {children}
      </main>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Dashboard />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute>
            <MainLayout>
              <Patients />
            </MainLayout>
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
