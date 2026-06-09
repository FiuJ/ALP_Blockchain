import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  UploadCloud,
  FileText,
  Loader2
} from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();

  const [hash, setHash] = useState('');
  const [isHashing, setIsHashing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!hash.trim()) return;
    navigate(`/verify/result/${hash.trim()}`);
  };

  // ==========================================
  // FUNGSI MENGHITUNG HASH PDF DI BROWSER
  // ==========================================
  const calculateSHA256 = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  };

  // ==========================================
  // HANDLER UPLOAD FILE PDF
  // ==========================================
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi format file
    if (file.type !== 'application/pdf') {
      alert('Sistem hanya menerima file dengan format .pdf');
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
      return;
    }

    setIsHashing(true);

    try {
      // 1. Ekstrak sidik jari (Hash) file PDF
      const fileHash = await calculateSHA256(file);
      
      // 2. Lempar hash tersebut ke halaman result
      navigate(`/verify/result/${fileHash}`);
    } catch (error) {
      console.error('Gagal memproses file:', error);
      alert('Terjadi kesalahan saat memproses file PDF.');
    } finally {
      setIsHashing(false);
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 font-sans">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldCheck className="text-blue-600 w-8 h-8" />
        </div>

        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 tracking-tight">
          Verifikasi Surat Medis
        </h1>

        <p className="text-gray-500 max-w-xl mx-auto">
          Pastikan keaslian surat keterangan medis Anda. Unggah file PDF dokumen untuk memverifikasi sidik jari digitalnya, atau masukkan Hash secara manual.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12 space-y-10">
          
          {/* Upload Area */}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isHashing}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 p-10 rounded-3xl transition-all flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 group disabled:opacity-70 disabled:cursor-wait"
            >
              {isHashing ? (
                <>
                  <div className="bg-blue-100 text-blue-600 p-4 rounded-full">
                    <Loader2 size={32} className="animate-spin" />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-900">Mengekstrak Hash...</p>
                    <p className="text-sm text-gray-500 mt-1">Membaca sidik jari dokumen</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="bg-blue-50 text-blue-600 p-4 rounded-full group-hover:scale-110 group-hover:bg-blue-100 transition-all">
                    <UploadCloud size={32} />
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-lg text-gray-900">Unggah File PDF Dokumen</p>
                    <p className="text-sm text-gray-500 mt-1">Klik untuk memilih file dari perangkat Anda</p>
                  </div>
                </>
              )}
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Divider */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-gray-400 font-bold text-xs tracking-widest">
              ATAU MANUAL
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Manual Hash */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                Masukkan Hash Dokumen
              </label>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>

                <input
                  type="text"
                  value={hash}
                  onChange={(e) => setHash(e.target.value)}
                  required
                  placeholder="Contoh: 0x1a2b3c4d..."
                  className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm sm:text-base shadow-sm"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95"
            >
              <Search size={18} /> Verifikasi Hash
            </button>
          </form>

        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-500 font-medium">
        <p>
          Akses verifikasi ini bersifat publik dan dijamin oleh jaringan Blockchain Ethereum.
        </p>
      </div>
    </div>
  );
}