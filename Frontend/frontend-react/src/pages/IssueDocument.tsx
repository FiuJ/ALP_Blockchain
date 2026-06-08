import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createWalletClient, custom, publicActions } from 'viem';
import { hardhat } from 'viem/chains';
import { useWallet } from '../hooks/useWallet';
import { useQuery } from '@tanstack/react-query'; // 👈 Import useQuery
import { apiService } from '../services/';
import DoctorLayout from '../layouts/DoctorLayout';
import { MEDICAL_NFT_ADDRESS, medicalNftABI } from '../config/MedicalDocumentContractConfig';
import { 
  FileText, 
  Send, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  User,
  Activity,
  CalendarClock,
  Tags,
  Search,
  X
} from 'lucide-react';

export default function IssueDocument() {
  const navigate = useNavigate();
  const { address } = useWallet();
  
  // ==========================================
  // STATE PASIEN & PENCARIAN
  // ==========================================
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{name: string, patientId: string, walletAddress: string} | null>(null);

  // Fetching daftar pasien
  const { data: patients = [], isLoading: isLoadingPatients } = useQuery({
    queryKey: ['allPatients'],
    queryFn: apiService.getAllPatients
  });

  // Logika Filter Pencarian
  const filteredPatients = patients.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.patientId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ==========================================
  // STATE FORM LAINNYA
  // ==========================================
  const [documentType, setDocumentType] = useState('Surat Keterangan Sakit');
  const [documentDescription, setDocumentDescription] = useState('');
  const [restDays, setRestDays] = useState<number>(3); 
  
  const [status, setStatus] = useState<'idle' | 'drafting' | 'signing' | 'minting' | 'finalizing' | 'success'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) return alert("Silakan connect wallet terlebih dahulu.");
    if (!selectedPatient) return alert("Silakan cari dan pilih pasien terlebih dahulu.");
    
    setErrorMessage('');

    try {
      // 1. DRAFT (Minta Hash dari Backend & Generate PDF)
      setStatus('drafting');
      const draftRes = await apiService.createDraft(address, { 
        patientWallet: selectedPatient.walletAddress, // 👈 Ambil dari objek yang dipilih
        documentType,
        documentDescription,
        restDays 
      });
      const documentHash = draftRes.data.hash; 
      
      const tokenURI = `http://localhost:5000/api/metadata/${documentHash}`;
      const expiredAtTimestamp = BigInt(Math.floor(Date.now() / 1000) + (restDays * 24 * 60 * 60));

      // 2. MINT KE BLOCKCHAIN
      setStatus('signing');
      const walletClient = createWalletClient({
        chain: hardhat, 
        transport: custom(window.ethereum!)
      }).extend(publicActions);

      try { await walletClient.switchChain({ id: hardhat.id }); } catch (e) {}

      const txHash = await walletClient.writeContract({
        address: MEDICAL_NFT_ADDRESS as `0x${string}`,
        abi: medicalNftABI,
        functionName: 'issueDocument',
        args: [
          documentHash, 
          tokenURI, 
          selectedPatient.walletAddress as `0x${string}`, // 👈 Bypass ke sini
          expiredAtTimestamp
        ],
        account: address as `0x${string}`
      });

      setStatus('minting');
      const receipt = await walletClient.waitForTransactionReceipt({ hash: txHash });
      const fakeTokenId = "1"; 

      // 3. FINALIZE (Simpan permanen ke MySQL)
      setStatus('finalizing');
      await apiService.finalizeDocument(address, {
        hash: documentHash,
        tokenId: fakeTokenId 
      });

      setStatus('success');
      setTimeout(() => navigate('/doctor/dashboard'), 2000);

    } catch (error: any) {
      console.error(error);
      setStatus('idle');
      
      if (error.code === 4001 || error.message?.includes('User rejected')) {
        setErrorMessage("Transaksi dibatalkan oleh pengguna (Tolak di Wallet).");
      } else {
        setErrorMessage(error.message || "Terjadi kesalahan saat menerbitkan dokumen.");
      }
    }
  };

  const renderSubmitButton = () => {
    switch (status) {
      case 'idle': return <><Send size={20} /> Tandatangani & Terbitkan NFT</>;
      case 'drafting': return <><Loader2 size={20} className="animate-spin" /> Enkripsi & Generate PDF...</>;
      case 'signing': return <><Loader2 size={20} className="animate-spin" /> Menunggu Tanda Tangan Wallet...</>;
      case 'minting': return <><Loader2 size={20} className="animate-spin" /> Mencatat di Blockchain...</>;
      case 'finalizing': return <><Loader2 size={20} className="animate-spin" /> Sinkronisasi MySQL...</>;
      case 'success': return <><CheckCircle size={20} /> Dokumen Berhasil Diterbitkan!</>;
    }
  };

  return (
    <DoctorLayout>
      <div className="max-w-2xl mx-auto py-12 px-4 w-full font-sans">
        
        <button 
          onClick={() => navigate(-1)}
          className="text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-2 font-medium transition-colors"
        >
          &larr; Kembali ke Dashboard
        </button>

        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100">
          
          <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
            <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
              <FileText size={32} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Terbitkan Dokumen Medis
              </h2>
              <p className="text-gray-500 text-sm mt-1">Data akan di-enkripsi dan diubah menjadi NFT.</p>
            </div>
          </div>
          
          {errorMessage && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
              <p className="text-sm font-medium text-red-800">{errorMessage}</p>
            </div>
          )}

          <form onSubmit={handleIssue} className="space-y-6">
            
            {/* ===================================== */}
            {/* SEARCH BAR PASIEN YANG DITINGKATKAN */}
            {/* ===================================== */}
            <div className="relative">
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <User size={16} className="text-blue-500" /> Pasien Tujuan
              </label>

              {selectedPatient ? (
                // Tampilan JIKA Pasien Sudah Dipilih
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div>
                    <p className="font-bold text-blue-900 flex items-center gap-2">
                      <CheckCircle size={16} className="text-blue-600" /> {selectedPatient.name}
                    </p>
                    <p className="text-xs font-mono text-blue-600/80 mt-1">NIK: {selectedPatient.patientId} | Wallet: {selectedPatient.walletAddress.substring(0,6)}...{selectedPatient.walletAddress.substring(38)}</p>
                  </div>
                  <button 
                    type="button" 
                    disabled={status !== 'idle'}
                    onClick={() => { setSelectedPatient(null); setSearchQuery(''); }}
                    className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <X size={20} />
                  </button>
                </div>
              ) : (
                // Tampilan JIKA Sedang Mencari Pasien
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input 
                    type="text" 
                    placeholder="Cari Nama Pasien atau NIK..."
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm transition-all"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setIsDropdownOpen(true);
                    }}
                    onFocus={() => setIsDropdownOpen(true)}
                  />

                  {/* Dropdown Hasil Pencarian */}
                  {isDropdownOpen && searchQuery && (
                    <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                      {isLoadingPatients ? (
                        <div className="p-4 text-center text-sm text-gray-500">Mencari...</div>
                      ) : filteredPatients.length > 0 ? (
                        filteredPatients.map((p: any) => (
                          <div 
                            key={p.walletAddress}
                            onClick={() => {
                              setSelectedPatient(p);
                              setIsDropdownOpen(false);
                            }}
                            className="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 transition-colors"
                          >
                            <p className="font-bold text-gray-800">{p.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">NIK: {p.patientId} • Wallet: {p.walletAddress.substring(0,8)}...</p>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-sm text-gray-500">Pasien tidak ditemukan.</div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* ===================================== */}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Tags size={16} className="text-blue-500" /> Jenis Dokumen
                </label>
                <select
                  disabled={status !== 'idle'}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm transition-all disabled:opacity-60 appearance-none"
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value)}
                >
                  <option value="Surat Keterangan Sakit">Surat Keterangan Sakit</option>
                  <option value="Surat Rujukan">Surat Rujukan</option>
                  <option value="Resep Obat">Resep Obat Digital</option>
                  <option value="Hasil Laboratorium">Hasil Laboratorium</option>
                </select>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <CalendarClock size={16} className="text-blue-500" /> Masa Berlaku (Hari)
                </label>
                <input 
                  type="number" 
                  min="1"
                  required 
                  disabled={status !== 'idle'}
                  className="w-full px-5 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 text-sm transition-all disabled:opacity-60"
                  value={restDays}
                  onChange={(e) => setRestDays(parseInt(e.target.value) || 0)} 
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Activity size={16} className="text-blue-500" /> Diagnosis & Keterangan
              </label>
              <textarea 
                required 
                rows={5} 
                placeholder="Tuliskan diagnosis, anjuran istirahat, atau detail resep..."
                disabled={status !== 'idle'}
                className="w-full px-5 py-4 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 transition-all resize-none disabled:opacity-60 text-sm leading-relaxed"
                value={documentDescription}
                onChange={(e) => setDocumentDescription(e.target.value)} 
              />
            </div>

            <button 
              type="submit" 
              disabled={status !== 'idle' || !selectedPatient} 
              className={`w-full font-bold py-4 rounded-xl shadow-md transition-all flex justify-center items-center gap-2 mt-8
                ${status === 'success' 
                  ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                  : status !== 'idle' || !selectedPatient
                    ? 'bg-blue-400 text-white cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:-translate-y-0.5 text-white'
                }`}
            >
              {renderSubmitButton()}
            </button>
            
          </form>
        </div>
      </div>
    </DoctorLayout>
  );
}