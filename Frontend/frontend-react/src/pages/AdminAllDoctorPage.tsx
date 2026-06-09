import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "../hooks/useWallet";
import { 
  ShieldAlert, 
  Wallet, 
  Loader2, 
  CheckCircle, 
  Activity, 
  FileText,
  Search,
  Users,
  Clock,
  AlertOctagon, // 👈 Ikon tambahan untuk Revoke
  XCircle
} from "lucide-react";
import { apiService } from "../services";

// 👇 Import Viem & Konfigurasi Smart Contract
import { createWalletClient, createPublicClient, custom, publicActions } from 'viem';
import { hardhat } from 'viem/chains';
// Sesuaikan path import config ini dengan struktur folder Anda
import { DOCTOR_REGISTRY_ADDRESS, doctorRegistryABI } from '../config/DoctorRegistryContractConfig';

export default function AdminAllDoctorsPage() {
  const { address, isRabby, connectWallet } = useWallet();
  const queryClient = useQueryClient(); // 👈 Inisialisasi Query Client untuk auto-refresh
  const [searchQuery, setSearchQuery] = useState("");
  const [revokingWallet, setRevokingWallet] = useState<string | null>(null); // 👈 State loading per baris

  // Fetching Semua Data Dokter
  const { data: allDoctors, isLoading, isError, error } = useQuery({
    queryKey: ["allDoctorsAdmin", address],
    queryFn: () => apiService.getAllDoctorsAdmin(address as string),
    enabled: !!address,
    retry: false
  });

  // Fungsi Filter Pencarian Cepat
  const filteredDoctors = allDoctors?.filter((doc: any) => {
    const query = searchQuery.toLowerCase();
    return (
      doc.name.toLowerCase().includes(query) ||
      doc.doctorLicenseNumber.toLowerCase().includes(query) ||
      doc.specialization.toLowerCase().includes(query)
    );
  }) || [];

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // ==========================================
  // FUNGSI HANDLE REVOKE DOKTER (SC + BACKEND)
  // ==========================================
  const handleRevokeDoctor = async (doctorWallet: string) => {
    if (!address) return alert("Wallet Admin belum terhubung.");

    const confirmRevoke = window.confirm(
      `PERINGATAN: Apakah Anda yakin ingin mencabut (Revoke) lisensi dokter ini?\n\nWallet: ${formatAddress(doctorWallet)}\n\nTindakan ini bersifat permanen di Blockchain dan sistem.`
    );
    if (!confirmRevoke) return;

    setRevokingWallet(doctorWallet);

    try {
      // 1. EKSEKUSI SMART CONTRACT
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum!)
      }).extend(publicActions);

      const publicClient = createPublicClient({
        chain: hardhat,
        transport: custom(window.ethereum!)
      });

      // Panggil fungsi revokeDoctor di Smart Contract DoctorRegistry
      const txHash = await walletClient.writeContract({
        address: DOCTOR_REGISTRY_ADDRESS as `0x${string}`,
        abi: doctorRegistryABI,
        functionName: 'revokeDoctor',
        args: [doctorWallet as `0x${string}`],
        account: address as `0x${string}`
      });

      // Tunggu konfirmasi blok
      await publicClient.waitForTransactionReceipt({ hash: txHash });

      // 2. EKSEKUSI DATABASE BACKEND
      await apiService.revokeDoctorAdmin(doctorWallet, address);

      // 3. REFRESH DATA TABEL
      queryClient.invalidateQueries({ queryKey: ["allDoctorsAdmin", address] });
      alert("✅ Akses dokter berhasil dicabut secara permanen!");

    } catch (error: any) {
      console.error("Gagal merevoke dokter:", error);
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        alert("Transaksi Web3 dibatalkan oleh Admin.");
      } else {
        alert(error.message || "Terjadi kesalahan saat merevoke dokter.");
      }
    } finally {
      setRevokingWallet(null);
    }
  };

  // ==========================================
  // STATE 1 & 2: KONEKSI DOMPET & ERROR (Diringkas agar fokus ke perubahan)
  // ==========================================
  if (!address) {
    return ( /* ... (Kode UI Belum Terkoneksi Sama) ... */
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Portal Administrator</h2>
          <p className="text-gray-500 mb-8 text-sm">Harap hubungkan dompet Admin Anda untuk melihat master data dokter.</p>
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

  if (isError) {
    return ( /* ... (Kode UI Error Sama) ... */
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-red-50 p-8 rounded-3xl max-w-md w-full text-center border border-red-100">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Akses Ditolak</h2>
          <p className="text-red-600/80 text-sm mb-4">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 3: UI MASTER DATA DOKTER
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Dashboard */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          {/* ... (Kode Header Dashboard Sama) ... */}
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <Users size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Master Data Dokter</h1>
              <p className="text-gray-500 text-sm">Keseluruhan database tenaga medis terdaftar</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRabby ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <p className="text-sm font-mono font-bold text-indigo-800">
              Admin: {formatAddress(address)}
            </p>
          </div>
        </div>

        {/* Tabel Data Dokter */}
        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200 overflow-hidden">
          
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800">
              Daftar Tenaga Medis ({filteredDoctors.length})
            </h2>
            <div className="relative w-full sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari nama, SIP, spesialisasi..."
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
                  <th className="px-6 py-4">Data Dokter</th>
                  <th className="px-6 py-4">Informasi Medis</th>
                  <th className="px-6 py-4">Tanggal Daftar</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Aksi</th> {/* 👈 Kolom Aksi */}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      <Loader2 size={32} className="text-indigo-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Memuat database...</p>
                    </td>
                  </tr>
                ) : filteredDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-500">
                      {searchQuery ? "Tidak ada dokter yang cocok dengan pencarian Anda." : "Belum ada data dokter di dalam sistem."}
                    </td>
                  </tr>
                ) : (
                  filteredDoctors.map((doc: any) => (
                    <tr key={doc.walletAddress} className="hover:bg-gray-50 transition-colors">
                      
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-base">{doc.name}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-mono">
                          <Wallet size={12} /> {formatAddress(doc.walletAddress)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1.5">
                          <span className="font-semibold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded text-xs w-fit border border-gray-200">
                            SIP: {doc.doctorLicenseNumber}
                          </span>
                          <p className="font-medium text-gray-800 flex items-center gap-1.5 text-xs">
                            <Activity size={12} className="text-indigo-500" /> {doc.specialization}
                          </p>
                          <p className="text-gray-500 text-xs flex items-center gap-1.5">
                            <FileText size={12} className="text-gray-400" /> {doc.clinicName}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-gray-500">
                        {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric', month: 'long', year: 'numeric'
                        }) : '-'}
                      </td>

                      <td className="px-6 py-4">
                        {doc.isVerified ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                            <CheckCircle size={14} /> Terverifikasi
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700 border border-amber-200">
                            <Clock size={14} /> Dibatalkan / Menunggu
                          </span>
                        )}
                      </td>

                      {/* 👇 Kolom Aksi (Tombol Revoke) */}
                      <td className="px-6 py-4 text-right">
                        {doc.isVerified && (
                          <button
                            onClick={() => handleRevokeDoctor(doc.walletAddress)}
                            disabled={revokingWallet === doc.walletAddress}
                            className="inline-flex items-center gap-1.5 text-rose-600 hover:text-white text-sm font-bold transition-colors bg-rose-50 hover:bg-rose-600 px-3 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed border border-rose-200 hover:border-rose-600"
                          >
                            {revokingWallet === doc.walletAddress ? (
                              <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                            ) : (
                              <><AlertOctagon size={16} /> Revoke Lisensi</>
                            )}
                          </button>
                        )}
                        {!doc.isVerified && (
                          <span className="text-xs font-semibold text-gray-400 flex items-center justify-end gap-1">
                            <XCircle size={14} /> Akses Tertutup
                          </span>
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
    </div>
  );
}