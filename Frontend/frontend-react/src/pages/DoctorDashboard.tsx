import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { FileText, Plus, CheckCircle, XCircle, Activity, ExternalLink } from 'lucide-react';

export default function DoctorDashboard() {
  const { address } = useAccount();
  const [documents, setDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!address) return;
      try {
        // Asumsi Endpoint: Mengambil semua dokumen yang diterbitkan oleh dokter ini
        const res = await axios.get(`http://localhost:3000/api/doctors/${address}/documents`);
        setDocuments(res.data);
      } catch (error) {
        console.error("Gagal mengambil riwayat dokumen", error);
        // Fallback data dummy untuk keperluan preview UI jika API belum siap
        setDocuments([
          { tokenId: '101', date: new Date().toISOString(), patientAddress: '0x123...abc', isValid: true },
          { tokenId: '102', date: new Date(Date.now() - 86400000).toISOString(), patientAddress: '0x456...def', isValid: false },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [address]);

  // Kalkulasi Metrik Singkat
  const totalIssued = documents.length;
  const activeDocs = documents.filter(d => d.isValid).length;
  const revokedDocs = totalIssued - activeDocs;

  return (
    <div className="max-w-6xl mx-auto py-8">
      {/* Header & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Portal Dokter</h1>
          <p className="text-gray-500 mt-1">Kelola dan terbitkan surat keterangan medis digital.</p>
        </div>
        <Link 
          to="/doctor/issue-document"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-semibold transition shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Terbitkan Surat Baru
        </Link>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-4 rounded-2xl text-blue-600"><FileText size={28} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Total Diterbitkan</p>
            <p className="text-2xl font-black text-gray-900">{totalIssued}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-600"><CheckCircle size={28} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Dokumen Aktif</p>
            <p className="text-2xl font-black text-gray-900">{activeDocs}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="bg-rose-50 p-4 rounded-2xl text-rose-600"><XCircle size={28} /></div>
          <div>
            <p className="text-gray-500 text-sm font-medium">Dibatalkan (Revoked)</p>
            <p className="text-2xl font-black text-gray-900">{revokedDocs}</p>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100 flex items-center gap-2">
          <Activity className="text-blue-600" size={20} />
          <h2 className="text-xl font-bold text-gray-900">Riwayat Penerbitan</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-sm">
                <th className="px-8 py-4 font-medium">ID Dokumen (Token ID)</th>
                <th className="px-8 py-4 font-medium">Tanggal Rilis</th>
                <th className="px-8 py-4 font-medium">Wallet Pasien</th>
                <th className="px-8 py-4 font-medium">Status</th>
                <th className="px-8 py-4 font-medium text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Memuat data...</td></tr>
              ) : documents.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-10 text-gray-500">Belum ada dokumen yang diterbitkan.</td></tr>
              ) : (
                documents.map((doc, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-4 font-mono text-sm text-gray-900">#{doc.tokenId}</td>
                    <td className="px-8 py-4 text-sm text-gray-600">{new Date(doc.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</td>
                    <td className="px-8 py-4 font-mono text-sm text-blue-600">{doc.patientAddress.substring(0,6)}...{doc.patientAddress.substring(38)}</td>
                    <td className="px-8 py-4">
                      {doc.isValid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-200">
                          <CheckCircle size={12} /> Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold border border-rose-200">
                          <XCircle size={12} /> Dibatalkan
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-4 text-right">
                      <Link 
                        to={`/doctor/document/${doc.tokenId}`}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 text-sm font-semibold transition"
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
  );
}