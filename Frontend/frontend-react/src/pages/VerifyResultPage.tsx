import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { createPublicClient, createWalletClient, custom, http } from 'viem';
import { hardhat } from 'viem/chains'; // Ganti dengan 'sepolia' / 'mainnet' jika sudah live
import { ShieldCheck, ShieldAlert, History, FileWarning, Fingerprint, Loader2 } from 'lucide-react';

// Import Custom Hook dan Konfigurasi Kontrak dari repo Anda
import { useWallet } from '../hooks/useWallet';
import { MEDICAL_NFT_ADDRESS, medicalNftABI } from '../config/MedicalDocumentContractConfig';

export default function VerifyResultPage() {
  const { documentHash } = useParams();
  const { address } = useWallet(); // Menggunakan custom hook useWallet Anda
  
  const [data, setData] = useState<any>(null);
  const [tokenId, setTokenId] = useState<number | null>(null);
  const [status, setStatus] = useState<'loading' | 'valid' | 'revoked' | 'tampered' | 'not_found'>('loading');
  
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState(false);

  // =========================================================
  // 1. Verifikasi Hash File PDF ke Backend (Tugas Utama Backend)
  // =========================================================
  useEffect(() => {
    const verifyDoc = async () => {
      try {
        // Backend hanya bertugas memvalidasi Hash PDF dan mengembalikan TokenId
        const res = await axios.get(`http://localhost:3000/api/documents/verify/${documentHash}`);
        setData(res.data);
        setStatus(res.data.isValid ? 'valid' : 'revoked');
        
        // Simpan tokenId untuk menarik history dari Blockchain
        setTokenId(res.data.tokenId);
      } catch (error: any) {
        if (error.response?.data?.message === 'DOKUMEN TELAH DIMANIPULASI') {
          setStatus('tampered');
        } else {
          setStatus('not_found');
        }
      }
    };
    if (documentHash) verifyDoc();
  }, [documentHash]);

  // =========================================================
  // 2. Ambil History LANGSUNG dari Smart Contract (VIEM READ)
  // =========================================================
  const fetchHistoryFromSC = async (id: number) => {
    try {
      // Buat Public Client viem (Untuk operasi Read-Only)
      const publicClient = createPublicClient({
        chain: hardhat, // Sesuaikan dengan network Anda
        // Fallback: Jika ada window.ethereum pakai itu, jika tidak pakai RPC lokal
        transport: window.ethereum ? custom(window.ethereum) : http("http://127.0.0.1:8545")
      });
      
      // Tembak fungsi 'getVerificationHistory' di SC menggunakan viem
      const history = await publicClient.readContract({
        address: MEDICAL_NFT_ADDRESS as `0x${string}`,
        abi: medicalNftABI,
        functionName: 'getVerificationHistory',
        args: [BigInt(id)],
      }) as any[];

      setHistoryList(history);
    } catch (error) {
      console.error("Gagal mengambil histori dari Smart Contract", error);
    }
  };

  // Pantau kapan `tokenId` berhasil didapat dari backend, lalu jalankan tembakan ke SC
  useEffect(() => {
    if (tokenId !== null) fetchHistoryFromSC(tokenId);
  }, [tokenId]);

  // =========================================================
  // 3. Tulis Jejak HRD ke Smart Contract (VIEM WRITE)
  // =========================================================
  const handleRecordVerification = async () => {
    if (!address) return alert("Silakan klik 'Connect Wallet' di kanan atas terlebih dahulu untuk merekam jejak.");
    if (tokenId === null || !window.ethereum) return;

    setIsWriting(true);
    try {
      // Buat Public Client untuk menunggu struk transaksi (receipt)
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: custom(window.ethereum)
      });

      // Buat Wallet Client untuk menandatangani transaksi (Write)
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum)
      });
      
      // Eksekusi fungsi penambahan record pada Smart Contract
      const txHash = await walletClient.writeContract({
        address: MEDICAL_NFT_ADDRESS as `0x${string}`,
        abi: medicalNftABI,
        functionName: 'verifyDocumentByNFT',
        args: [BigInt(tokenId)],
        account: address as `0x${string}` // Alamat HRD yang sedang Connect Wallet
      });

      // Tunggu blok dikonfirmasi oleh jaringan
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      
      alert("Jejak verifikasi Anda berhasil dicatat secara permanen di Blockchain!");
      fetchHistoryFromSC(tokenId); // Segarkan ulang tabel history
      
    } catch (error) {
      console.error("Gagal mencatat verifikasi:", error);
      alert("Transaksi dibatalkan atau gagal.");
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Hasil Verifikasi</h1>
        <p className="text-gray-500">Pemeriksaan integritas dokumen via Blockchain Ethereum</p>
      </div>

      {status === 'loading' && (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        </div>
      )}

      {/* DETEKSI MANIPULASI MERAH */}
      {status === 'tampered' && (
        <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8">
          <ShieldAlert className="text-red-500 w-20 h-20 flex-shrink-0" />
          <div>
            <h2 className="text-2xl font-black text-red-700">DOKUMEN DIMANIPULASI</h2>
            <p className="text-red-600 mt-2">
              <strong>Peringatan Sistem:</strong> Hash dari file PDF ini tidak cocok dengan catatan *immutable* di blockchain. Isi dokumen telah diubah atau dipalsukan secara ilegal.
            </p>
          </div>
        </div>
      )}

      {/* STATUS ASLI ATAU DIBATALKAN */}
      {(status === 'valid' || status === 'revoked') && data && (
        <div className="space-y-8">
          
          {/* Card Status */}
          {status === 'valid' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 flex items-center gap-6 shadow-sm">
              <ShieldCheck className="text-emerald-500 w-16 h-16" />
              <div>
                <h2 className="text-2xl font-black text-emerald-700">ASLI & VALID</h2>
                <p className="text-emerald-600">Dokumen ini diterbitkan oleh dokter resmi dan secara kriptografis terbukti belum direkayasa.</p>
              </div>
            </div>
          ) : (
             <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 flex items-center gap-6 shadow-sm">
              <FileWarning className="text-amber-500 w-16 h-16" />
              <div>
                <h2 className="text-2xl font-black text-amber-700">DIBATALKAN OLEH DOKTER</h2>
                <p className="text-amber-600">Dokumen ini ditarik kembali (revoked) oleh dokter yang menerbitkannya.</p>
              </div>
            </div>
          )}

          {/* TABEL AUDIT TRAIL (LANGSUNG DARI SMART CONTRACT MENGGUNAKAN VIEM) */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8 mt-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <History className="text-blue-600" /> Jejak Audit Verifikasi
              </h3>
              
              {/* Tombol HRD */}
              <button 
                onClick={handleRecordVerification}
                disabled={isWriting}
                className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold transition flex items-center gap-2 shadow-md disabled:bg-gray-400"
              >
                <Fingerprint size={16} /> 
                {isWriting ? 'Merekam Tx...' : 'Catat Verifikasi Saya'}
              </button>
            </div>

            <div className="space-y-4">
              {historyList.map((record, i) => {
                // Viem biasanya mengembalikan struct sebagai object dengan key (jika didefinisikan di ABI)
                // Atau sebagai Array jika key tidak bernama. Kita buat fallback untuk keduanya:
                const verifierAddress = record.verifier || record[0];
                const timestamp = Number(record.timestamp || record[1]); // Ubah dari BigInt ke Number
                const date = new Date(timestamp * 1000).toLocaleString('id-ID', { dateStyle: 'full', timeStyle: 'short' });

                return (
                  <div key={i} className="flex justify-between items-center pb-4 border-b border-gray-100 last:border-0 p-2">
                    <div>
                      <span className="bg-blue-50 text-blue-700 font-mono text-xs px-3 py-1 rounded-full border border-blue-100">
                        {verifierAddress}
                      </span>
                      <p className="text-sm text-gray-500 mt-2 font-medium">Memeriksa keaslian dokumen</p>
                    </div>
                    <div className="text-sm font-bold text-gray-700">{date}</div>
                  </div>
                );
              })}

              {historyList.length === 0 && (
                <div className="text-center py-6 text-gray-400 font-medium">
                  Belum ada institusi/pihak yang merekam verifikasi dokumen ini di blockchain.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}