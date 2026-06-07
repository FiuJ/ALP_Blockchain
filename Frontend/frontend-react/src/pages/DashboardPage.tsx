import React from "react";
import MainLayout from "../layouts/MainLayout";
import { useWallet } from "../hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import {
  FileText,
  CheckCircle,
  XCircle,
  Wallet,
  Loader2,
  AlertCircle,
} from "lucide-react";

export default function DashboardPage() {
  const { address, isRabby, connectWallet } = useWallet();

  // Mengambil data dashboard menggunakan React Query
  // Akan berjalan otomatis JIKA wallet sudah terkoneksi (enabled: !!address)
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardData", address],
    queryFn: () => apiService.getDashboardStats(address as string),
    enabled: !!address,
  });

  // Helper untuk memotong format wallet address
  const formatAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // ==========================================
  // STATE 1: WALLET BELUM TERKONEKSI
  // ==========================================
  if (!address) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <Wallet size={40} />
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-3">
            Akses Terbatas
          </h2>
          <p className="text-gray-500 max-w-md mb-8">
            Harap hubungkan dompet Web3 Anda untuk melihat statistik dan riwayat
            dokumen medis.
          </p>
          <button
            onClick={connectWallet}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition-all shadow-lg hover:shadow-blue-500/30 flex items-center gap-2"
          >
            <Wallet size={20} />
            Connect Rabby Wallet
          </button>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // STATE 2: LOADING FETCH DATA
  // ==========================================
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 size={48} className="text-blue-600 animate-spin mb-4" />
          <p className="text-gray-500 font-medium">
            Sinkronisasi data dari Blockchain...
          </p>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // STATE 3: ERROR FETCH DATA
  // ==========================================
  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <AlertCircle size={48} className="text-red-500 mb-4" />
          <p className="text-gray-800 font-bold text-xl mb-2">
            Gagal Memuat Data
          </p>
          <p className="text-gray-500">
            Pastikan backend server Anda berjalan dengan normal.
          </p>
        </div>
      </MainLayout>
    );
  }

  // ==========================================
  // STATE 4: UI DASHBOARD UTAMA
  // ==========================================
  // Fallback data jika API masih kosong
  const stats = dashboardData?.stats || { total: 0, verified: 0, revoked: 0 };
  const recentDocuments = dashboardData?.documents || [];

  return (
    <MainLayout>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-500">
            Blockchain medical verification overview
          </p>
        </div>

        {/* Indikator Wallet Terkoneksi */}
        <div className="flex items-center gap-3 bg-white border border-gray-200 px-4 py-2.5 rounded-full shadow-sm">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-50">
            <Wallet size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="text-xs text-gray-400 font-medium leading-none mb-1">
              Connected Wallet
            </p>
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 rounded-full animate-pulse ${isRabby ? "bg-orange-500" : "bg-green-500"}`}
              ></div>
              <p className="text-sm font-mono font-bold text-gray-700 leading-none">
                {address}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Total Documents Card */}
        <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-xl shadow-blue-500/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-blue-50 group-hover:scale-110 transition-transform duration-500">
            <FileText size={120} />
          </div>
          <p className="text-gray-500 font-medium mb-2 relative z-10">
            Total Documents
          </p>
          <h2 className="text-5xl font-black text-gray-800 relative z-10">
            {stats.total}
          </h2>
        </div>

        {/* Verified Card */}
        <div className="bg-white border border-green-200 rounded-3xl p-6 shadow-xl shadow-green-500/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-green-50 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle size={120} />
          </div>
          <p className="text-gray-500 font-medium mb-2 relative z-10">
            Verified
          </p>
          <h2 className="text-5xl font-black text-green-500 relative z-10">
            {stats.verified}
          </h2>
        </div>

        {/* Revoked Card */}
        <div className="bg-white border border-red-200 rounded-3xl p-6 shadow-xl shadow-red-500/5 relative overflow-hidden group">
          <div className="absolute -right-6 -top-6 text-red-50 group-hover:scale-110 transition-transform duration-500">
            <XCircle size={120} />
          </div>
          <p className="text-gray-500 font-medium mb-2 relative z-10">
            Revoked
          </p>
          <h2 className="text-5xl font-black text-red-500 relative z-10">
            {stats.revoked}
          </h2>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl shadow-gray-200/40">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FileText size={20} className="text-blue-500" />
            Recent Documents
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4">Patient</th>
                <th className="px-6 py-4">Doctor</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Jika data dokumen kosong */}
              {recentDocuments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Belum ada dokumen medis yang tercatat.
                  </td>
                </tr>
              ) : (
                /* Mapping data dokumen jika ada */
                recentDocuments.map((doc: any, index: number) => (
                  <tr
                    key={index}
                    className="hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      {doc.patient}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{doc.doctor}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          doc.status.toLowerCase() === "verified"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {doc.status.toLowerCase() === "verified" ? (
                          <CheckCircle size={12} />
                        ) : (
                          <XCircle size={12} />
                        )}
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(doc.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
}
