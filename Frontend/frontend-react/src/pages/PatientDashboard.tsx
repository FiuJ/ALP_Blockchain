import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { ShieldCheck, FolderHeart, QrCode, FileText } from 'lucide-react';

export default function PatientDashboard() {
  const { address } = useAccount();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchVault = async () => {
      if (!address) return;
      try {
        // Asumsi Endpoint: Mengambil semua dokumen yang dimiliki pasien ini
        const res = await axios.get(`http://localhost:3000/api/patients/${address}/documents`);
        setDocuments(res.data);
      } catch (error) {
        console.error("Gagal mengambil brankas dokumen", error);
        // Fallback data dummy
        setDocuments([
          { tokenId: '101', date: new Date().toISOString(), doctorName: 'dr. Budi Santoso', doctorAddress: '0x999...111', isValid: true },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVault();
  }, [address]);

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-10 mb-10 text-white shadow-lg flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-medium mb-4 backdrop-blur-sm">
            <ShieldCheck size={16} /> Secured by Ethereum
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2">Brankas Medis Digital</h1>
          <p className="text-blue-100 max-w-xl">
            Semua surat keterangan medis Anda tersimpan dengan aman sebagai NFT di blockchain. Bebas dari risiko hilang atau rusak.
          </p>
        </div>
        <div className="hidden md:block opacity-80">
          <FolderHeart size={100} strokeWidth={1} />
        </div>
      </div>

      {/* Vault List / Grid */}
      <h2 className="text-2xl font-bold text-gray-900 mb-6 px-2">Dokumen Saya</h2>
      
      {isLoading ? (
        <div className="text-center py-20 text-gray-500 font-medium">Membuka brankas...</div>
      ) : documents.length === 0 ? (
        <div className="bg-white rounded-3xl border border-gray-200 p-16 text-center shadow-sm">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Brankas Kosong</h3>
          <p className="text-gray-500">Anda belum menerima surat medis dari dokter manapun.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition group relative overflow-hidden">
              
              {/* Badge Status */}
              <div className="absolute top-6 right-6">
                {doc.isValid ? (
                  <span className="w-3 h-3 rounded-full bg-emerald-500 block shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Valid"></span>
                ) : (
                  <span className="w-3 h-3 rounded-full bg-rose-500 block shadow-[0_0_8px_rgba(244,63,94,0.8)]" title="Dibatalkan"></span>
                )}
              </div>

              <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-1">Surat Keterangan Sakit</h3>
              <p className="text-sm text-gray-500 mb-4 flex flex-col gap-1">
                <span>Diterbitkan oleh: <strong>{doc.doctorName || 'Dokter Terdaftar'}</strong></span>
                <span>Tanggal: {new Date(doc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </p>

              <div className="pt-4 border-t border-gray-100 flex items-center gap-3 mt-4">
                <Link 
                  to={`/patient/document/${doc.tokenId}`}
                  className="flex-1 bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 text-center py-2.5 rounded-full text-sm font-semibold transition"
                >
                  Lihat PDF
                </Link>
                <Link 
                  to={`/patient/document/${doc.tokenId}`}
                  className="flex-none bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-md transition"
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
  );
}