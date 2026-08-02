import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Patient {
  id: string;
  no_rm: string;
  nik: string;
  name: string;
  gender: 'L' | 'P';
  birth_date: string;
  phone: string;
  address: string;
}

export const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

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
      }
    } catch (error) {
      console.error('Failed to fetch patients', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [page]); // Re-fetch on page change

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchPatients();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Master Data Pasien</h1>
      
      <div className="flex justify-between items-center mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search by Name, NIK, or RM..."
            className="border px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Search
          </button>
        </form>
        
        <button className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
          + Tambah Pasien
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. RM</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIK</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">L/P</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No. HP</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">Loading...</td>
              </tr>
            ) : patients.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center">Tidak ada data pasien.</td>
              </tr>
            ) : (
              patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{patient.no_rm}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.nik}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{patient.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{patient.phone || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                    <button className="text-red-600 hover:text-red-900">Hapus</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-700">
          Halaman {page} dari {totalPages || 1}
        </span>
        <div className="flex gap-2">
          <button 
            disabled={page <= 1}
            onClick={() => setPage(p => p - 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Sebelumnya
          </button>
          <button 
            disabled={page >= totalPages}
            onClick={() => setPage(p => p + 1)}
            className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
          >
            Selanjutnya
          </button>
        </div>
      </div>
    </div>
  );
};
