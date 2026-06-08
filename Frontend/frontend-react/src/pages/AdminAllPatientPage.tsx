import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../hooks/useWallet";
// import { apiService } from "../services/api";
import AdminLayout from "../layouts/AdminLayout";
import { 
  ShieldAlert, 
  Wallet, 
  Loader2, 
  Users,
  Search,
  User,
  CreditCard,
  Calendar
} from "lucide-react";
import { apiService } from "../services";

export default function AdminAllPatientsPage() {
  const { address, isRabby, connectWallet } = useWallet();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetching Semua Data Pasien
  const { data: allPatients, isLoading, isError, error } = useQuery({
    queryKey: ["allPatientsAdmin", address],
    queryFn: () => apiService.getAllPatientsAdmin(address as string),
    enabled: !!address,
    retry: false
  });

  // Fungsi Filter Pencarian Cepat
  const filteredPatients = allPatients?.filter((patient: any) => {
    const query = searchQuery.toLowerCase();
    return (
      patient.name.toLowerCase().includes(query) ||
      patient.patientId.toLowerCase().includes(query) // Asumsi nama field NIK/Rekam Medis adalah patientId
    );
  }) || [];

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // ==========================================
  // STATE 1: WALLET BELUM TERKONEKSI
  // ==========================================
  if (!address) {
    return (
      
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
            <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Portal Administrator</h2>
            <p className="text-gray-500 mb-8 text-sm">Harap hubungkan dompet Admin Anda untuk melihat data pasien.</p>
            <button 
              onClick={connectWallet}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={20} /> Connect Admin Wallet
            </button>
          </div>
        </div>
     
    );
  }

  // ==========================================
  // STATE 2: ERROR / BUKAN ADMIN (403)
  // ==========================================
  if (isError) {
    return (
      
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-red-50 p-8 rounded-3xl max-w-md w-full text-center border border-red-100">
            <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Akses Ditolak</h2>
            <p className="text-red-600/80 text-sm mb-4">{(error as Error).message}</p>
          </div>
        </div>
     
    );
  }

  // ==========================================
  // STATE 3: UI MASTER DATA PASIEN
  // ==========================================
  return (
    
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Dashboard */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-100 rounded-xl">
                <Users size={28} className="text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Database Pasien</h1>
                <p className="text-gray-500 text-sm">Keseluruhan pengguna yang terdaftar sebagai pasien</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
              <div className={`w-2 h-2 rounded-full animate-pulse ${isRabby ? 'bg-orange-500' : 'bg-green-500'}`}></div>
              <p className="text-sm font-mono font-bold text-indigo-800">
                Admin: {formatAddress(address)}
              </p>
            </div>
          </div>

          {/* Tabel Data Pasien */}
          <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200 overflow-hidden">
            
            {/* Action Bar (Search & Filter Info) */}
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
              <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <User size={20} className="text-indigo-600" />
                Daftar Pasien ({filteredPatients.length})
              </h2>
              
              {/* Search Input */}
              <div className="relative w-full sm:w-72">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                  <Search size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Cari nama atau NIK..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-600 outline-none transition-all text-sm"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-white text-gray-500 font-medium uppercase tracking-wider text-xs border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4">Data Pasien</th>
                    <th className="px-6 py-4">NIK / Rekam Medis</th>
                    <th className="px-6 py-4">Tanggal Registrasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  
                  {isLoading ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-12 text-center">
                        <Loader2 size={32} className="text-indigo-600 animate-spin mx-auto mb-2" />
                        <p className="text-gray-500">Memuat database pasien...</p>
                      </td>
                    </tr>
                  ) : filteredPatients.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="px-6 py-16 text-center text-gray-500">
                        {searchQuery ? "Tidak ada pasien yang cocok dengan pencarian Anda." : "Belum ada data pasien di dalam sistem."}
                      </td>
                    </tr>
                  ) : (
                    filteredPatients.map((patient: any) => (
                      <tr key={patient.walletAddress} className="hover:bg-gray-50 transition-colors">
                        
                        {/* Kolom Nama & Wallet */}
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 text-base">{patient.name}</p>
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-mono">
                            <Wallet size={12} /> {formatAddress(patient.walletAddress)}
                          </div>
                        </td>

                        {/* Kolom NIK */}
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-700 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                            <CreditCard size={14} className="text-indigo-500" />
                            {patient.patientId}
                          </span>
                        </td>

                        {/* Kolom Tanggal */}
                        <td className="px-6 py-4 text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-gray-400" />
                            {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString('id-ID', {
                              day: 'numeric', month: 'long', year: 'numeric'
                            }) : '-'}
                          </span>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    
  );
}