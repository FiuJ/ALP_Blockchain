import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { createPublicClient, createWalletClient, custom, http } from "viem";
import { hardhat } from "viem/chains";
import {
  ShieldCheck,
  ShieldAlert,
  History,
  FileWarning,
  Fingerprint,
  Loader2,
  ArrowLeft,
  ExternalLink, // 👈 Tambahan ikon
} from "lucide-react";

import { apiService } from "../services";
import { useWallet } from "../hooks/useWallet";
import {
  MEDICAL_NFT_ADDRESS,
  medicalNftABI,
} from "../config/MedicalDocumentContractConfig";

export default function VerifyResultPage() {
  const params = useParams();
  const { documentHash } = useParams();
  const { address, connectWallet } = useWallet();
  const [doctorName, setDoctorName] = useState<string>("Memuat nama...");
  const [patientName, setPatientName] = useState<string>("Memuat nama...");
  const [data, setData] = useState<any>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "loading" | "valid" | "revoked" | "tampered" | "not_found"
  >("loading");

  const [historyList, setHistoryList] = useState<any[]>([]);
  const [isWriting, setIsWriting] = useState(false);
console.log(historyList)
  // 👇 1. STATE BARU: Menyimpan detail event Revoke dari Blockchain
  const [revokeDetails, setRevokeDetails] = useState<{
    txHash: string;
    timestamp: number;
  } | null>(null);

  // =========================================================
  // 1. Verifikasi Hash File PDF ke Backend
  // =========================================================
  useEffect(() => {
    const verifyDoc = async () => {
      if (!documentHash) return;

      try {
        const res = await apiService.verifyDocument(documentHash);
        setData(res.document);
        setStatus(res.status === "AUTHENTIC" ? "valid" : "revoked");
        setTokenId(res.document.tokenId);
      } catch (error: any) {
        console.error("❌ ERROR:", error);
        const errorMessage = error.message || "";
        if (errorMessage.includes("MANIPULASI")) {
          setStatus("tampered");
        } else if (
          errorMessage.includes("DIBATALKAN") ||
          errorMessage.includes("REVOKED")
        ) {
          setStatus("revoked");
        } else {
          setStatus("not_found");
        }
      }
    };
    verifyDoc();
  }, [documentHash]);

  // =========================================================
  // Ambil Nama Asli dengan Menembak API Backend
  // =========================================================
  useEffect(() => {
    const fetchNames = async () => {
      if (!data || !data.issuerWallet || !data.patientWallet) return;
      try {
        const docRes = await fetch(
          `http://localhost:5000/api/doctors/${data.issuerWallet}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": data.issuerWallet,
            },
          },
        );
        if (docRes.ok) {
          const docJson = await docRes.json();
          setDoctorName(docJson.data?.name || "Dokter Terdaftar");
        } else {
          setDoctorName("Nama dokter tidak ditemukan");
        }

        const patRes = await fetch(
          `http://localhost:5000/api/patients/${data.patientWallet}`,
          {
            headers: {
              "Content-Type": "application/json",
              "x-wallet-address": data.patientWallet,
            },
          },
        );
        if (patRes.ok) {
          const patJson = await patRes.json();
          setPatientName(patJson.data?.name || "Pasien Terdaftar");
        } else {
          setPatientName("Nama pasien tidak ditemukan");
        }
      } catch (error) {
        setDoctorName("Gagal memuat API");
        setPatientName("Gagal memuat API");
      }
    };
    fetchNames();
  }, [data]);

  // =========================================================
  // 2. MEMBACA DATA & EVENT LANGSUNG DARI SMART CONTRACT
  // =========================================================
  const fetchOnChainData = async (id: string) => {
    try {
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: window.ethereum
          ? custom(window.ethereum)
          : http("http://127.0.0.1:8545"),
      });

      // A. Membaca History Verifikasi
      const history = (await publicClient.readContract({
        address: MEDICAL_NFT_ADDRESS as `0x${string}`,
        abi: medicalNftABI,
        functionName: "getVerificationHistory",
        args: [BigInt(id)],
      })) as any[];
      setHistoryList([...history].reverse());

      // 👇 B. MEMBACA EVENT REVOKE DARI BLOCKCHAIN
      // Catatan: Pastikan nama event di Solidity Anda adalah 'DocumentRevoked'
      const revokeLogs = await publicClient.getContractEvents({
        address: MEDICAL_NFT_ADDRESS as `0x${string}`,
        abi: medicalNftABI,
        eventName: "DocumentRevoked",
        args: { tokenId: BigInt(id) }, // Mencari event khusus untuk tokenId ini
        fromBlock: 0n,
        toBlock: "latest",
      });

      // Jika ada log event pembatalan yang ditemukan di Blockchain
      if (revokeLogs && revokeLogs.length > 0) {
        const latestRevokeEvent = revokeLogs[revokeLogs.length - 1];

        // Ambil data blok untuk mengetahui waktu (Timestamp) pasti terjadinya revoke
        const block = await publicClient.getBlock({
          blockHash: latestRevokeEvent.blockHash,
        });

        setStatus("revoked"); // Override status menjadi revoked (Blockchain source of truth)
        setRevokeDetails({
          txHash: latestRevokeEvent.transactionHash,
          timestamp: Number(block.timestamp),
        });
      }
    } catch (error) {
      console.error("Gagal mengambil data on-chain:", error);
    }
  };

  useEffect(() => {
    if (tokenId !== null) fetchOnChainData(tokenId);
  }, [tokenId]);

  // =========================================================
  // 3. Tulis Jejak HRD ke Smart Contract (VIEM WRITE)
  // =========================================================
  const handleRecordVerification = async () => {
    if (!window.ethereum)
      return alert("Ekstensi Dompet Web3 tidak terdeteksi di browser ini.");
    if (!address) {
      alert(
        "Silakan hubungkan Dompet Web3 Anda terlebih dahulu untuk merekam jejak.",
      );
      connectWallet();
      return;
    }
    if (tokenId === null) return;

    setIsWriting(true);
    try {
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: custom(window.ethereum),
      });
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum),
      });

      const txHash = await walletClient.writeContract({
        address: MEDICAL_NFT_ADDRESS as `0x${string}`,
        abi: medicalNftABI,
        functionName: "verifyDocumentByNFT",
        args: [BigInt(tokenId)],
        account: address as `0x${string}`,
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      alert(
        "✅ Jejak verifikasi Anda berhasil dicatat secara permanen di Blockchain!",
      );
      fetchOnChainData(tokenId);
    } catch (error: any) {
      if (error.code === 4001 || error.message?.includes("User rejected")) {
        alert("Transaksi dibatalkan oleh Anda.");
      } else {
        alert("Gagal merekam jejak ke Blockchain.");
      }
    } finally {
      setIsWriting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/verify"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Kembali ke Pencarian
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
            Hasil Verifikasi Dokumen
          </h1>
          <p className="text-gray-500">
            Pemeriksaan integritas dokumen via Blockchain Ethereum
          </p>
        </div>

        {status === "loading" && (
          <div className="flex flex-col justify-center items-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-500 font-medium">
              Melakukan validasi kriptografi...
            </p>
          </div>
        )}

        {status === "not_found" && (
          <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 text-center shadow-sm mb-8">
            <ShieldAlert className="text-gray-400 w-20 h-20 mx-auto mb-4" />
            <h2 className="text-2xl font-black text-gray-700">
              DOKUMEN TIDAK DITEMUKAN
            </h2>
            <p className="text-gray-500 mt-2">
              Hash dokumen ini tidak terdaftar di dalam sistem kami.
            </p>
          </div>
        )}

        {status === "tampered" && (
          <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-6 shadow-sm mb-8 animate-in zoom-in-95">
            <ShieldAlert className="text-red-500 w-20 h-20 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-black text-red-700 uppercase tracking-wide">
                Peringatan: Dokumen Dimanipulasi
              </h2>
              <p className="text-red-600/90 mt-2 leading-relaxed">
                Hash dari file PDF ini tidak cocok dengan catatan *immutable* di
                blockchain. Isi dokumen kemungkinan besar telah diubah, diedit,
                atau dipalsukan secara ilegal.
              </p>
            </div>
          </div>
        )}

        {(status === "valid" || status === "revoked") && data && (
          <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500">
            {status === "valid" ? (
              <div className="bg-emerald-50 border-2 border-emerald-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
                <ShieldCheck className="text-emerald-500 w-16 h-16 flex-shrink-0" />
                <div className="text-center md:text-left w-full">
                  <h2 className="text-2xl font-black text-emerald-700 uppercase tracking-wide mb-1">
                    Dokumen Asli & Valid
                  </h2>
                  <p className="text-emerald-700/80 mb-4">
                    Dokumen ini diterbitkan oleh tenaga medis resmi dan secara
                    kriptografis terbukti belum direkayasa.
                  </p>

                  <div className="bg-white/60 rounded-xl p-4 grid grid-cols-2 gap-4 text-sm border border-emerald-100">
                    <div>
                      <p className="text-emerald-600/70 font-bold uppercase text-[10px] tracking-wider mb-1">
                        Pasien
                      </p>
                      <p className="font-bold text-emerald-900 text-base">
                        {patientName}
                      </p>
                      <p className="text-[10px] text-emerald-700/60 font-mono mt-0.5 bg-emerald-100/50 w-fit px-1.5 py-0.5 rounded">
                        {data.patientWallet.substring(0, 6)}...
                        {data.patientWallet.substring(38)}
                      </p>
                    </div>
                    <div>
                      <p className="text-emerald-600/70 font-bold uppercase text-[10px] tracking-wider mb-1">
                        Dokter Penerbit
                      </p>
                      <p className="font-bold text-emerald-900 text-base">
                        {doctorName}
                      </p>
                      <p className="text-[10px] text-emerald-700/60 font-mono mt-0.5 bg-emerald-100/50 w-fit px-1.5 py-0.5 rounded">
                        {data.issuerWallet.substring(0, 6)}...
                        {data.issuerWallet.substring(38)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border-2 border-amber-500/30 rounded-3xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6 shadow-sm">
                <FileWarning className="text-amber-500 w-16 h-16 flex-shrink-0" />
                <div className="text-center md:text-left w-full">
                  <h2 className="text-2xl font-black text-amber-700 uppercase tracking-wide mb-1">
                    Dibatalkan (Revoked)
                  </h2>
                  <p className="text-amber-700/80 mb-4">
                    Dokumen ini telah ditarik kembali secara resmi oleh dokter
                    yang menerbitkannya.
                  </p>

                  {/* 👇 MENAMPILKAN BUKTI EVENT REVOKE DARI BLOCKCHAIN */}
                  {revokeDetails && (
                    <div className="bg-white/60 rounded-xl p-4 text-sm border border-amber-200">
                      <p className="text-amber-700 font-bold uppercase text-[10px] tracking-wider mb-2 flex items-center gap-1">
                        <History size={12} /> Bukti Pembatalan Blockchain
                      </p>
                      <div className="space-y-1.5">
                        <p className="text-amber-900">
                          <span className="text-amber-700/70 inline-block w-20">
                            Waktu:
                          </span>
                          <span className="font-semibold">
                            {new Date(
                              revokeDetails.timestamp * 1000,
                            ).toLocaleString("id-ID", {
                              dateStyle: "long",
                              timeStyle: "short",
                            })}{" "}
                            WIB
                          </span>
                        </p>
                        <p className="text-amber-900 flex items-center gap-1">
                          <span className="text-amber-700/70 inline-block w-20">
                            Tx Hash:
                          </span>
                          <span className="font-mono text-xs bg-amber-100/50 px-1.5 py-0.5 rounded text-amber-800">
                            {revokeDetails.txHash.substring(0, 10)}...
                            {revokeDetails.txHash.substring(58)}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TABEL AUDIT TRAIL TETAP SAMA SEPERTI SEBELUMNYA */}
            <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-8">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4 pb-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <History className="text-blue-600" /> Jejak Audit Publik
                </h3>
                <button
                  onClick={handleRecordVerification}
                  disabled={isWriting}
                  className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-md hover:shadow-lg disabled:bg-gray-400 disabled:shadow-none active:scale-95"
                >
                  {isWriting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Merekam ke
                      Blockchain...
                    </>
                  ) : (
                    <>
                      <Fingerprint size={16} /> Catat Verifikasi Saya
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-1">
                {historyList.map((record, i) => {
                  const verifierAddress = record.verifier || record[0];
                const timestampMs = Number(record.verifiedAt) * 1000;
                  
                  // 3. Buat objek Date JavaScript
                  const dateObj = new Date(timestampMs);

                  return (
                    <div
                      key={i}
                      className="flex flex-col md:flex-row md:justify-between md:items-center py-4 border-b border-gray-50 last:border-0 gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span className="bg-blue-50 text-blue-700 font-mono text-xs px-3 py-1 rounded-full border border-blue-100">
                            {verifierAddress.substring(0, 6)}...
                            {verifierAddress.substring(38)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 font-medium">
                          Telah memverifikasi keaslian dokumen ini.
                        </p>
                      </div>
                      <div className="text-sm font-bold text-gray-700 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 text-center">
                        {/* 4. Tampilkan Tanggal */}
                        {dateObj.toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                        <br className="hidden md:block" />
                        <span className="text-xs text-gray-400 font-normal">
                          {/* 5. Tampilkan Jam */}
                          {dateObj.toLocaleTimeString("id-ID", {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} WIB
                        </span>
                      </div>
                    </div>
                  );
                })}
                {historyList.length === 0 && (
                  <div className="text-center py-10 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Fingerprint className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-sm">
                      Belum ada institusi/pihak yang merekam jejak verifikasi
                      dokumen ini.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
