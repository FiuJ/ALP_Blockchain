import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createWalletClient, custom, publicActions } from "viem";
import { hardhat } from "viem/chains";
import { useWallet } from "../hooks/useWallet";
import { 
  ShieldAlert, 
  Wallet, 
  Loader2, 
  CheckCircle, 
  UserCheck, 
  Activity, 
  FileText 
} from "lucide-react";
import { apiService } from "../services";
// 👇 Import Contract Address dan ABI untuk Registry Dokter Anda
import { DOCTOR_REGISTRY_ADDRESS, doctorRegistryABI } from "../config/DoctorRegistryContractConfig"; 

export default function AdminDashboardPage() {
  const { address, isRabby, connectWallet } = useWallet();
  const queryClient = useQueryClient();
  
  // State untuk melacak status proses
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState<string>("");

  // 1. Fetching Data Dokter Pending
  const { data: pendingDoctors, isLoading, isError, error } = useQuery({
    queryKey: ["pendingDoctors", address],
    queryFn: () => apiService.getPendingDoctors(address as string),
    enabled: !!address,
    retry: false 
  });

  // 2. Mutation untuk Update Database MySQL (Langkah Terakhir)
  const verifyDbMutation = useMutation({
    mutationFn: (doctorWallet: string) => apiService.verifyDoctor(address as string, doctorWallet),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingDoctors"] });
      alert("✅ Dokter berhasil diverifikasi di Blockchain dan Database!");
    },
    onError: (err: any) => {
      alert(`❌ Blockchain berhasil, tapi gagal update Database: ${err.message}`);
    },
    onSettled: () => {
      setProcessingId(null);
      setLoadingText("");
    }
  });

  // 3. FUNGSI UTAMA: Panggil Blockchain lalu Update Database
  const handleVerify = async (doctorWallet: string) => {
    if (!confirm("Apakah Anda yakin ingin memverifikasi lisensi dokter ini ke Blockchain?")) return;
    
    setProcessingId(doctorWallet);

    try {
      // TAHAP 1: EKSEKUSI SMART CONTRACT VIA VIEM
      setLoadingText("Menunggu Tanda Tangan Dompet...");
      
      const walletClient = createWalletClient({
        chain: hardhat, 
        transport: custom(window.ethereum!)
      }).extend(publicActions);

      // Pastikan jaringan benar
      try { await walletClient.switchChain({ id: hardhat.id }); } catch (e) {}

      // Panggil fungsi verifyDoctor di Smart Contract
      // Sesuaikan nama fungsi 'verifyDoctor' dengan yang ada di Solidity Anda
      const txHash = await walletClient.writeContract({
        address: DOCTOR_REGISTRY_ADDRESS as `0x${string}`,
        abi: doctorRegistryABI,
        functionName: 'verifyDoctor', 
        args: [doctorWallet as `0x${string}`],
        account: address as `0x${string}`
      });

      setLoadingText("Mencatat di Blockchain...");
      
      // Tunggu hingga transaksi selesai ditambang
      await walletClient.waitForTransactionReceipt({ hash: txHash });

      // TAHAP 2: UPDATE DATABASE MYSQL VIA BACKEND
      setLoadingText("Sinkronisasi Database...");
      verifyDbMutation.mutate(doctorWallet);

    } catch (err: any) {
      console.error(err);
      setProcessingId(null);
      setLoadingText("");
      
      if (err.code === 4001 || err.message?.includes('User rejected')) {
        alert("❌ Transaksi dibatalkan oleh Admin di dalam Dompet.");
      } else {
        alert(`❌ Gagal memverifikasi di Blockchain: ${err.message}`);
      }
    }
  };

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // ==========================================
  // STATE 1: WALLET BELUM TERKONEKSI
  // ==========================================
  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {/* ... (Kode UI sama persis dengan milik Anda) ... */}
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full text-center border border-gray-100">
          <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Portal Administrator</h2>
          <p className="text-gray-500 mb-8 text-sm">
            Harap hubungkan Dompet Deployer (Admin) Anda untuk mengakses panel verifikasi medis.
          </p>
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
  // STATE 2: ERROR / BUKAN ADMIN
  // ==========================================
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        {/* ... (Kode UI sama persis dengan milik Anda) ... */}
        <div className="bg-red-50 p-8 rounded-3xl max-w-md w-full text-center border border-red-100">
          <ShieldAlert size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-700 mb-2">Akses Ditolak</h2>
          <p className="text-red-600/80 text-sm mb-4">{(error as Error).message}</p>
          <p className="text-xs text-red-500 font-mono bg-red-100 p-2 rounded-lg break-all">
            Wallet Anda: {address}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // STATE 3: UI ADMIN DASHBOARD
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl">
              <ShieldAlert size={28} className="text-indigo-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Control Panel</h1>
              <p className="text-gray-500 text-sm">Verifikasi Lisensi Tenaga Medis</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full">
            <div className={`w-2 h-2 rounded-full animate-pulse ${isRabby ? 'bg-orange-500' : 'bg-green-500'}`}></div>
            <p className="text-sm font-mono font-bold text-indigo-800">
              Admin: {formatAddress(address)}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/40 border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <UserCheck size={20} className="text-indigo-600" />
              Menunggu Verifikasi ({pendingDoctors?.length || 0})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 font-medium uppercase tracking-wider text-xs">
                <tr>
                  <th className="px-6 py-4">Data Dokter</th>
                  <th className="px-6 py-4">Nomor SIP</th>
                  <th className="px-6 py-4">Spesialisasi & Klinik</th>
                  <th className="px-6 py-4 text-right">Aksi Verifikasi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center">
                      <Loader2 size={32} className="text-indigo-600 animate-spin mx-auto mb-2" />
                      <p className="text-gray-500">Memuat data dokter...</p>
                    </td>
                  </tr>
                ) : !pendingDoctors || pendingDoctors.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-3">
                        <CheckCircle size={32} className="text-green-500" />
                      </div>
                      <p className="text-gray-800 font-bold text-lg">Semua Bersih!</p>
                      <p className="text-gray-500">Tidak ada pendaftaran dokter baru yang menunggu verifikasi.</p>
                    </td>
                  </tr>
                ) : (
                  pendingDoctors.map((doc: any) => (
                    <tr key={doc.walletAddress} className="hover:bg-indigo-50/30 transition-colors">
                      
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 text-base">{doc.name}</p>
                        <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 font-mono">
                          <Wallet size={12} /> {formatAddress(doc.walletAddress)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="font-semibold text-gray-700 bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                          {doc.doctorLicenseNumber}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-800 flex items-center gap-1.5">
                          <Activity size={14} className="text-indigo-500" /> {doc.specialization}
                        </p>
                        <p className="text-gray-500 text-xs mt-1 flex items-center gap-1.5">
                          <FileText size={14} className="text-gray-400" /> {doc.clinicName}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleVerify(doc.walletAddress)}
                          disabled={processingId === doc.walletAddress}
                          className={`inline-flex items-center justify-center min-w-[160px] gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                            processingId === doc.walletAddress
                              ? "bg-indigo-100 text-indigo-500 cursor-wait"
                              : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-lg hover:-translate-y-0.5"
                          }`}
                        >
                          {processingId === doc.walletAddress ? (
                            <>
                              <Loader2 size={16} className="animate-spin" /> 
                              {/* Teks dinamis sesuai status Viem */}
                              <span className="text-xs">{loadingText || "Memproses..."}</span>
                            </>
                          ) : (
                            <><CheckCircle size={16} /> Verifikasi</>
                          )}
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
    </div>
  );
}