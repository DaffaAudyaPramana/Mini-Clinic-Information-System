import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Patients } from './pages/Patients';
import { useAuth } from './contexts/AuthContext';
import { Link } from 'react-router-dom';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  const { logout, user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 flex">
              {/* Sidebar */}
              <div className="w-64 bg-white shadow-md">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-blue-600">Mini Clinic</h2>
                </div>
                <nav className="mt-6">
                  <Link to="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Dashboard</Link>
                  <Link to="/patients" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Master Pasien</Link>
                </nav>
              </div>
              
              {/* Main Content */}
              <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-end items-center">
                  <span className="mr-4">Welcome, {user?.name} ({user?.role})</span>
                  <button 
                    onClick={logout}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm"
                  >
                    Logout
                  </button>
                </header>
                <main className="flex-1 overflow-auto">
                  <div className="p-8">
                    <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
                    <p>Welcome to Mini Clinic Information System. Use the sidebar to navigate.</p>
                  </div>
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/patients" 
        element={
          <ProtectedRoute>
            <div className="min-h-screen bg-gray-100 flex">
              <div className="w-64 bg-white shadow-md">
                <div className="p-6">
                  <h2 className="text-xl font-bold text-blue-600">Mini Clinic</h2>
                </div>
                <nav className="mt-6">
                  <Link to="/dashboard" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Dashboard</Link>
                  <Link to="/patients" className="block px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600">Master Pasien</Link>
                </nav>
              </div>
              <div className="flex-1 flex flex-col">
                <header className="bg-white shadow-sm p-4 flex justify-end items-center">
                  <span className="mr-4">Welcome, {user?.name} ({user?.role})</span>
                  <button onClick={logout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 text-sm">Logout</button>
                </header>
                <main className="flex-1 overflow-auto">
                  <Patients />
                </main>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
