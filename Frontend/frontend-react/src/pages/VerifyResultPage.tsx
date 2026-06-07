import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, ShieldAlert, History, FileWarning } from 'lucide-react';
// import { useWriteContract } from 'wagmi';

export default function VerifyResultPage() {
  const { documentHash } = useParams();
  const [data, setData] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [status, setStatus] = useState<'loading' | 'valid' | 'revoked' | 'tampered' | 'not_found'>('loading');

  useEffect(() => {
    const verifyDoc = async () => {
      try {
        // 1. Panggil Smart Contract verifyDocumentByNFT() agar tercatat di Blockchain HRD yang nge-scan
        // await writeContractAsync({ ... })

        // 2. Verifikasi Hash & PDF dari Backend (Poin 5 & 6)
        const res = await axios.get(`http://localhost:3000/api/documents/verify/${documentHash}`);
        setData(res.data);
        setStatus(res.data.isValid ? 'valid' : 'revoked');

        // 3. Ambil History Verifikasi (Poin 8)
        const histRes = await axios.get(`http://localhost:3000/api/documents/${res.data.tokenId}/history`);
        setHistory(histRes.data);

      } catch (error: any) {
        if (error.response?.data?.message === 'DOKUMEN TELAH DIMANIPULASI') {
          setStatus('tampered');
        } else {
          setStatus('not_found');
        }
      }
    };
    verifyDoc();
  }, [documentHash]);

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Hasil Verifikasi</h1>
        <p className="text-gray-500">Pemeriksaan integritas dokumen via Blockchain Ethereum</p>
      </div>

      {status === 'loading' && <p className="text-center text-gray-500">Menganalisis Kriptografi...</p>}

      {/* DETEKSI MANIPULASI MERAH (Poin 6) */}
      {status === 'tampered' && (
        <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-8 flex items-center gap-6 shadow-sm mb-8">
          <ShieldAlert className="text-red-500 w-16 h-16 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-black text-red-700">DOKUMEN DIMANIPULASI</h2>
            <p className="text-red-600 mt-2">Peringatan: Hash dari file PDF fisik tidak cocok dengan catatan immutable di blockchain. Dokumen ini telah diubah secara ilegal.</p>
          </div>
        </div>
      )}

      {/* STATUS ASLI / REVOKED */}
      {(status === 'valid' || status === 'revoked') && data && (
        <div className="space-y-8">
          {status === 'valid' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex items-center gap-6 shadow-sm">
              <ShieldCheck className="text-emerald-500 w-16 h-16" />
              <div>
                <h2 className="text-2xl font-black text-emerald-700">ASLI & VALID</h2>
                <p className="text-emerald-600">Dokumen ini diterbitkan oleh dokter terdaftar dan belum direkayasa.</p>
              </div>
            </div>
          ) : (
             <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex items-center gap-6 shadow-sm">
              <FileWarning className="text-amber-500 w-16 h-16" />
              <div>
                <h2 className="text-2xl font-black text-amber-700">DIBATALKAN OLEH DOKTER</h2>
                <p className="text-amber-600">Dokumen asli, namun telah dicabut/direvoke oleh dokter penerbit (Kemungkinan salah diagnosis).</p>
              </div>
            </div>
          )}

          {/* AUDIT TRAIL (Poin 8) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <History className="text-blue-600" /> Jejak Audit Verifikasi
            </h3>
            <div className="space-y-4">
              {history.map((record, i) => (
                <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0">
                  <div>
                    <span className="bg-gray-100 text-gray-600 font-mono text-xs px-3 py-1 rounded-full">
                      {record.verifier}
                    </span>
                    <p className="text-sm text-gray-500 mt-2">Memeriksa keaslian dokumen</p>
                  </div>
                  <div className="text-sm font-semibold text-gray-700">
                    {new Date(record.timestamp * 1000).toLocaleString()}
                  </div>
                </div>
              ))}
              {history.length === 0 && <p className="text-gray-500 text-sm">Belum ada yang memverifikasi dokumen ini.</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}