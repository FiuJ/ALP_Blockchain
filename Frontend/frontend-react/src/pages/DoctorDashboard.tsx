import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useWallet } from "../hooks/useWallet";
// import { apiService } from "../services/api";
import DoctorLayout from "../layouts/DoctorLayout";
import {
  FileText,
  Plus,
  CheckCircle,
  XCircle,
  Activity,
  ExternalLink,
  Wallet,
  ShieldAlert,
  Loader2,
  Building2,
  BadgeCheck,
  LogOut,
  Eye, // 👈 Import ikon Eye (Mata)
  X, // 👈 Import ikon X (Close)
} from "lucide-react";
import { apiService } from "../services";
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL?.replace("/api", "") ||
  "http://localhost:5000";
export default function DoctorDashboard() {
  const { address, connectWallet, disconnectWallet } = useWallet();
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  // 1. Fetching Profil Dokter
  const {
    data: profile,
    isLoading: isProfileLoading,
    isError: isProfileError,
    error: profileError,
  } = useQuery({
    queryKey: ["doctorProfile", address],
    queryFn: () => apiService.getProfile(address as string, "doctor"),
    enabled: !!address,
  });

  // 2. Fetching Riwayat Dokumen
  const { data: documents = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ["doctorDocuments", address],
    queryFn: () => apiService.getDoctorDocuments(address as string),
    enabled: !!address,
  });

  const isLoading = isProfileLoading || isDocsLoading;
  const isVerified = profile?.isVerified;

  // Kalkulasi Metrik
  const totalIssued = documents.length;
  const activeDocs = documents.filter((doc: any) => doc.isValid).length;
  const revokedDocs = totalIssued - activeDocs;
  console.log(documents);

  // ==========================================
  // STATE 1: WALLET BELUM TERKONEKSI
  // ==========================================
  if (!address) {
    return (
      <DoctorLayout>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Akses Dokter
            </h2>
            <p className="text-gray-500 mb-8 text-sm">
              Harap hubungkan dompet Web3 Anda untuk mengelola dan menerbitkan
              surat medis.
            </p>
            <button
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={20} /> Connect Wallet
            </button>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  // ==========================================
  // STATE 2: ERROR FETCH DATA
  // ==========================================
  if (isProfileError) {
    return (
      <DoctorLayout>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-red-50 p-8 rounded-3xl max-w-md w-full text-center border border-red-100 shadow-sm animate-in zoom-in-95 duration-300">
            <ShieldAlert size={56} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-700 mb-2">
              Akses Ditolak
            </h2>
            <p className="text-red-600/80 mb-2 text-sm">
              Dompet Web3 ini tidak terdaftar sebagai <strong>Dokter</strong>.{" "}
              {/* 👈 UBAH JADI DOKTER */}
            </p>
            <p className="text-red-600/70 mb-6 text-xs bg-red-100/50 p-3 rounded-lg border border-red-100">
              {/* 👇 GUNAKAN profileError, BUKAN isProfileError */}
              {(profileError as Error)?.message ||
                "Silakan gunakan portal yang sesuai (Pasien/Admin) atau daftar terlebih dahulu."}
            </p>
            <button
              onClick={disconnectWallet}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mx-auto shadow-md hover:shadow-lg active:scale-95 w-full"
            >
              <LogOut size={18} /> Putuskan Koneksi Dompet
            </button>
          </div>
        </div>
      </DoctorLayout>
    );
  }

  // ==========================================
  // STATE 3: UI DASHBOARD UTAMA
  // ==========================================
  return (
    <DoctorLayout>
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 w-full font-sans">
        {/* Banner Welcome & Verifikasi */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10 relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="absolute -right-10 -top-10 text-blue-50/50 rotate-12 scale-150 z-0 pointer-events-none">
            <BadgeCheck size={200} />
          </div>

          <div className="relative z-10">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Selamat datang, {profile?.name || "Dokter"}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-gray-500 text-sm font-medium">
              <span className="flex items-center gap-1.5">
                <Building2 size={16} /> {profile?.clinicName || "-"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1.5">
                <Activity size={16} /> {profile?.specialization || "-"}
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className="font-mono">
                SIP: {profile?.doctorLicenseNumber || "-"}
              </span>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            {isVerified ? (
              <Link
                to="/doctor/issue-document"
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 w-full md:w-auto"
              >
                <Plus size={20} /> Terbitkan Surat
              </Link>
            ) : (
              <div className="bg-amber-50 border border-amber-200 px-5 py-3 rounded-xl flex items-start gap-3 max-w-sm">
                <ShieldAlert
                  size={20}
                  className="text-amber-500 shrink-0 mt-0.5"
                />
                <div>
                  <p className="text-amber-800 font-bold text-sm">
                    Akun Dalam Peninjauan
                  </p>
                  <p className="text-amber-700/80 text-xs mt-1">
                    Anda belum dapat menerbitkan surat hingga Admin
                    memverifikasi lisensi Anda.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
              <FileText size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Total Diterbitkan
              </p>
              <p className="text-3xl font-black text-gray-900">
                {isLoading ? "-" : totalIssued}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-colors">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600">
              <CheckCircle size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Dokumen Aktif
              </p>
              <p className="text-3xl font-black text-gray-900">
                {isLoading ? "-" : activeDocs}
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-rose-200 transition-colors">
            <div className="bg-rose-50 p-4 rounded-2xl text-rose-600">
              <XCircle size={32} />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">
                Dibatalkan
              </p>
              <p className="text-3xl font-black text-gray-900">
                {isLoading ? "-" : revokedDocs}
              </p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">
                Riwayat Penerbitan
              </h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-gray-500 text-sm uppercase tracking-wider">
                  <th className="px-8 py-4 font-semibold">ID Dokumen</th>
                  <th className="px-8 py-4 font-semibold">Tanggal Rilis</th>
                  <th className="px-8 py-4 font-semibold">Pasien Tujuan</th>
                  <th className="px-8 py-4 font-semibold">Status</th>
                  <th className="px-8 py-4 font-semibold text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16 text-gray-500">
                      <Loader2
                        size={32}
                        className="animate-spin text-blue-600 mx-auto mb-3"
                      />
                      Sinkronisasi data blockchain...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <FileText
                        size={48}
                        className="text-gray-300 mx-auto mb-3"
                      />
                      <p className="text-gray-500 font-medium text-lg">
                        Belum ada riwayat
                      </p>
                      <p className="text-gray-400 text-sm">
                        Dokumen yang Anda terbitkan akan muncul di sini.
                      </p>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc: any, idx: number) => (
                    <tr
                      key={idx}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-8 py-5 font-mono text-sm font-bold text-gray-900">
                        #{doc.tokenId}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">
                        {new Date(doc.issuedAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          {/* substring */}

                          {doc.patientWallet}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {doc.isRevoked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            <XCircle size={14} /> Dibatalkan
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCircle size={14} /> Aktif
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        {/* 👇 UBAH TOMBOL INI UNTUK MEMBUKA MODAL PREVIEW */}
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100 mr-2"
                        >
                          <Eye size={16} /> Preview
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {previewDoc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            {/* Header Modal */}
            <div className="flex justify-between items-center p-5 border-b border-gray-100 bg-gray-50/80">
              <div>
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                  <FileText size={20} className="text-blue-600"/> 
                  Preview Dokumen Medis
                </h3>
                <p className="text-xs text-gray-500 font-mono mt-0.5">Token ID: #{previewDoc.tokenId}</p>
              </div>
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Konten PDF Iframe */}
            <div className="flex-grow bg-gray-200/50 p-2 md:p-6">
              <iframe 
                src={`${BACKEND_URL}/files/${previewDoc.filePath}`} 
                className="w-full h-full rounded-xl border border-gray-300 shadow-sm bg-white"
                title="PDF Preview"
              />
            </div>

            {/* Footer Modal (Aksi Lanjutan) */}
            <div className="p-5 border-t border-gray-100 bg-white flex justify-end gap-3">
              <button 
                onClick={() => setPreviewDoc(null)} 
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-colors"
              >
                Tutup Preview
              </button>
              <Link 
                to={`/doctor/document/${previewDoc.tokenId}`} 
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                Ke Halaman Detail <ExternalLink size={16} />
              </Link>
            </div>

          </div>
        </div>
      )}
    </DoctorLayout>
  );
}
