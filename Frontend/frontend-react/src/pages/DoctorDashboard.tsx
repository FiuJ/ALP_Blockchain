import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../hooks/useWallet';
import { apiService } from '../services/api';
import DoctorLayout from '../layouts/DoctorLayout';
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
  BadgeCheck
} from 'lucide-react';

export default function DoctorDashboard() {
  const { address, connectWallet } = useWallet();

  // 1. Fetching Profil Dokter
  const { data: profile, isLoading: isProfileLoading, isError: isProfileError } = useQuery({
    queryKey: ['doctorProfile', address],
    queryFn: () => apiService.getProfile(address as string, "doctor"),
    enabled: !!address,
  });

  // 2. Fetching Riwayat Dokumen
  const { data: documents = [], isLoading: isDocsLoading } = useQuery({
    queryKey: ['doctorDocuments', address],
    queryFn: () => apiService.getDoctorDocuments(address as string),
    enabled: !!address,
  });

  const isLoading = isProfileLoading || isDocsLoading;
  const isVerified = profile?.isVerified;

  // Kalkulasi Metrik
  const totalIssued = documents.length;
  const activeDocs = documents.filter((doc: any) => doc.isValid).length;
  const revokedDocs = totalIssued - activeDocs;

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
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Akses Dokter</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Harap hubungkan dompet Web3 Anda untuk mengelola dan menerbitkan surat medis.
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
        <div className="max-w-6xl mx-auto py-12 px-4 text-center">
          <div className="bg-red-50 p-8 rounded-3xl inline-block border border-red-100">
            <XCircle size={48} className="text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Gagal Memuat Profil</h2>
            <p className="text-red-600/80 text-sm">Pastikan Anda terdaftar sebagai Dokter di sistem ini.</p>
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
              <span className="flex items-center gap-1.5"><Building2 size={16}/> {profile?.clinicName || "-"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className="flex items-center gap-1.5"><Activity size={16}/> {profile?.specialization || "-"}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
              <span className="font-mono">SIP: {profile?.doctorLicenseNumber || "-"}</span>
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
                <ShieldAlert size={20} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-amber-800 font-bold text-sm">Akun Dalam Peninjauan</p>
                  <p className="text-amber-700/80 text-xs mt-1">Anda belum dapat menerbitkan surat hingga Admin memverifikasi lisensi Anda.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-blue-200 transition-colors">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><FileText size={32} /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Total Diterbitkan</p>
              <p className="text-3xl font-black text-gray-900">{isLoading ? "-" : totalIssued}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-emerald-200 transition-colors">
            <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><CheckCircle size={32} /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Dokumen Aktif</p>
              <p className="text-3xl font-black text-gray-900">{isLoading ? "-" : activeDocs}</p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-5 hover:border-rose-200 transition-colors">
            <div className="bg-rose-50 p-4 rounded-2xl text-rose-600"><XCircle size={32} /></div>
            <div>
              <p className="text-gray-500 text-sm font-medium mb-1">Dibatalkan</p>
              <p className="text-3xl font-black text-gray-900">{isLoading ? "-" : revokedDocs}</p>
            </div>
          </div>
        </div>

        {/* History Table */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-2">
              <Activity className="text-blue-600" size={20} />
              <h2 className="text-xl font-bold text-gray-900">Riwayat Penerbitan</h2>
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
                      <Loader2 size={32} className="animate-spin text-blue-600 mx-auto mb-3" />
                      Sinkronisasi data blockchain...
                    </td>
                  </tr>
                ) : documents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-16">
                      <FileText size={48} className="text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500 font-medium text-lg">Belum ada riwayat</p>
                      <p className="text-gray-400 text-sm">Dokumen yang Anda terbitkan akan muncul di sini.</p>
                    </td>
                  </tr>
                ) : (
                  documents.map((doc: any, idx: number) => (
                    <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-8 py-5 font-mono text-sm font-bold text-gray-900">
                        #{doc.tokenId}
                      </td>
                      <td className="px-8 py-5 text-sm text-gray-600">
                        {new Date(doc.createdAt).toLocaleDateString('id-ID', { 
                          day: 'numeric', month: 'short', year: 'numeric' 
                        })}
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-mono text-sm text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg border border-gray-200">
                          {doc.patientAddress.substring(0, 6)}...{doc.patientAddress.substring(38)}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        {doc.isValid ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                            <CheckCircle size={14} /> Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                            <XCircle size={14} /> Dibatalkan
                          </span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link 
                          to={`/doctor/document/${doc.tokenId}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-bold transition-colors bg-white hover:bg-blue-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-blue-100"
                        >
                          Detail <ExternalLink size={16} />
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DoctorLayout>
  );
}