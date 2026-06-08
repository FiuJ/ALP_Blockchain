import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useWallet } from '../hooks/useWallet';
// import { apiService } from '../services/api';
import PatientLayout from '../layouts/PatientLayout';
import { 
  ShieldCheck, 
  FolderHeart, 
  QrCode, 
  FileText,
  Wallet,
  ShieldAlert,
  Loader2,
  XCircle
} from 'lucide-react';
import { apiService } from '../services';

export default function PatientDashboard() {
  const { address, connectWallet } = useWallet();

  // Fetching riwayat dokumen pasien
  const { data: documents = [], isLoading, isError, error } = useQuery({
    queryKey: ['patientDocuments', address],
    queryFn: () => apiService.getPatientDocuments(address as string),
    enabled: !!address,
  });

  // ==========================================
  // STATE 1: WALLET BELUM TERKONEKSI
  // ==========================================
  if (!address) {
    return (
      <PatientLayout>
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldAlert size={40} />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Brankas Pasien</h2>
            <p className="text-gray-500 mb-8 text-sm">
              Harap hubungkan dompet Web3 Anda untuk mengakses rekam medis digital Anda.
            </p>
            <button 
              onClick={connectWallet}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
            >
              <Wallet size={20} /> Connect Wallet
            </button>
          </div>
        </div>
      </PatientLayout>
    );
  }

  // ==========================================
  // STATE 2: UI UTAMA (DASHBOARD PASIEN)
  // ==========================================
  return (
    <PatientLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 w-full">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-10 mb-10 text-white shadow-lg flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
              <ShieldCheck size={16} /> Secured by Ethereum
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Brankas Medis Digital</h1>
            <p className="text-blue-100 max-w-xl">
              Semua surat keterangan medis Anda tersimpan dengan aman sebagai NFT di blockchain. Bebas dari risiko hilang atau rusak.
            </p>
          </div>
          <div className="hidden md:block opacity-30 absolute right-10 top-5 transform rotate-12 scale-110">
            <FolderHeart size={160} strokeWidth={1} />
          </div>
        </div>

        {/* Vault List / Grid */}
        <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2 flex items-center gap-2">
          <FolderHeart className="text-blue-600" /> Dokumen Saya
        </h2>
        
        {/* Logika Kondisional (Loading -> Error -> Kosong -> Ada Data) */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500 font-medium">
            <Loader2 size={40} className="animate-spin text-blue-600 mb-4" />
            <p>Membuka brankas terenkripsi...</p>
          </div>
        ) : isError ? (
          <div className="bg-red-50 rounded-3xl border border-red-100 p-16 text-center shadow-sm">
            <XCircle size={48} className="mx-auto text-red-500 mb-4" />
            <h3 className="text-xl font-bold text-red-700 mb-2">Gagal Membuka Brankas</h3>
            <p className="text-red-600/80">{(error as Error).message}</p>
          </div>
        ) : documents.length === 0 ? (
          <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
            <FileText size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Brankas Kosong</h3>
            <p className="text-gray-500">Anda belum menerima surat medis dari dokter manapun.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {documents.map((doc: any, idx: number) => (
              <div key={idx} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col">
                
                {/* Badge Status */}
                <div className="absolute top-6 right-6 z-10">
                  {doc.isValid ? (
                    <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-100">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Aktif</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full border border-rose-100">
                      <span className="w-2 h-2 rounded-full bg-rose-500 block shadow-[0_0_8px_rgba(244,63,94,0.8)]"></span>
                      <span className="text-[10px] font-bold uppercase tracking-wider">Batal</span>
                    </div>
                  )}
                </div>

                <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">Surat Keterangan Sakit</h3>
                <p className="text-sm text-gray-500 mb-4 flex flex-col gap-1.5 flex-grow">
                  <span>Diterbitkan oleh:<br/><strong className="text-gray-800">{doc.doctorName || 'Dokter Terdaftar'}</strong></span>
                  <span className="text-xs bg-gray-100 w-fit px-2 py-0.5 rounded text-gray-600 mt-1">
                    {new Date(doc.createdAt || doc.date).toLocaleDateString('id-ID', { 
                      day: 'numeric', month: 'long', year: 'numeric' 
                    })}
                  </span>
                </p>

                <div className="pt-4 border-t border-gray-100 flex items-center gap-3 mt-auto">
                  <Link 
                    to={`/patient/document/${doc.tokenId}`}
                    className="flex-1 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 text-center py-2.5 rounded-full text-sm font-semibold transition-colors"
                  >
                    Lihat PDF
                  </Link>
                  <Link 
                    to={`/patient/document/${doc.tokenId}`}
                    className="flex-none bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition-transform hover:scale-105"
                    title="Generate QR Code untuk HRD"
                  >
                    <QrCode size={18} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </PatientLayout>
  );
}