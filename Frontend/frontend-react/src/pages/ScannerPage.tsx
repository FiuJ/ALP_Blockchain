import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  QrCode,
  Search,
  ShieldCheck,
  Camera,
  X,
  Upload,
} from 'lucide-react';

export default function ScannerPage() {
  const navigate = useNavigate();

  const [hash, setHash] = useState('');
  const [isScanning, setIsScanning] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hash.trim()) return;

    navigate(`/verify/result/${hash.trim()}`);
  };

  const handleScanSuccess = (scannedHash: string) => {
    setIsScanning(false);
    navigate(`/verify/result/${scannedHash}`);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log('File uploaded:', file);

    /**
     * TODO:
     * Process image QR here using:
     * - jsQR
     * - html5-qrcode
     *
     * Example:
     * const scannedHash = await readQrFromImage(file);
     * navigate(`/verify/result/${scannedHash}`);
     */

    alert(
      'QR image uploaded. Integrate QR Reader library to extract hash.'
    );
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
          <ShieldCheck className="text-blue-600 w-8 h-8" />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Verifikasi Surat Medis
        </h1>

        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Pastikan keaslian surat keterangan sakit karyawan Anda.
          Pindai QR Code, upload gambar QR, atau masukkan hash
          secara manual.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12">
          {isScanning ? (
            <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
              <div className="w-full max-w-sm aspect-square bg-gray-900 rounded-3xl relative overflow-hidden flex flex-col items-center justify-center border-4 border-gray-800 shadow-2xl">
                {/*
                  Replace this section with your QR Reader component
                  
                  Example:
                  <QrReader
                    onResult={(result) => {
                      if (result) {
                        handleScanSuccess(result.getText());
                      }
                    }}
                  />
                */}

                <Camera className="text-gray-500 w-12 h-12 mb-4 animate-pulse" />

                <p className="text-gray-400 text-sm font-medium">
                  Kamera sedang aktif...
                </p>

                <div className="absolute inset-0 border-[3px] border-blue-500/50 m-8 rounded-xl border-dashed" />
              </div>

              <button
                onClick={() => setIsScanning(false)}
                className="mt-8 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-full font-bold transition flex items-center gap-2"
              >
                <X size={20} />
                Batal Pindai
              </button>
            </div>
          ) : (
            <div className="space-y-10">
              {/* Camera + Upload */}
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={() => setIsScanning(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-3xl font-bold transition shadow-xl flex flex-col items-center gap-3"
                >
                  <QrCode size={32} />
                  Aktifkan Kamera
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 p-6 rounded-3xl font-bold transition shadow-sm flex flex-col items-center gap-3 border-2 border-dashed border-gray-300"
                >
                  <Upload size={32} />
                  Upload QR Image
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>

              <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-gray-200"></div>

                <span className="flex-shrink-0 mx-4 text-gray-400 font-medium text-sm">
                  ATAU MANUAL
                </span>

                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              {/* Manual Hash */}
              <form
                onSubmit={handleManualSubmit}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 text-center">
                    Masukkan Hash Dokumen Manual
                  </label>

                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>

                    <input
                      type="text"
                      value={hash}
                      onChange={(e) => setHash(e.target.value)}
                      required
                      placeholder="0x..."
                      className="block w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-mono text-sm sm:text-base shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-full font-bold transition shadow-md flex items-center justify-center gap-2"
                >
                  Verifikasi Hash
                </button>
              </form>
            </div>
          )}
        </div>
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>
          Akses verifikasi ini bersifat publik dan tidak memerlukan
          registrasi akun.
        </p>
      </div>
    </div>
  );
}