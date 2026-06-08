import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  ShieldCheck,
  Upload,
} from 'lucide-react';

export default function UploadPage() {
  const navigate = useNavigate();

  const [hash, setHash] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!hash.trim()) return;

    // Arahkan ke halaman hasil verifikasi dengan hash
    navigate(`/verify/result/${hash.trim()}`);
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    console.log('File uploaded:', file);

    /**
     * TODO:
     * Process image QR here using library like jsQR or html5-qrcode
     *
     * Example:
     * const scannedHash = await readQrFromImage(file);
     * navigate(`/verify/result/${scannedHash}`);
     */

    alert(
      'QR image uploaded. Integrate QR Reader library to extract hash from image.'
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
          Pastikan keaslian surat keterangan sakit. Upload gambar QR Code 
          dari dokumen Anda, atau masukkan hash secara manual.
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="p-8 md:p-12 space-y-10">
          
          {/* Upload Area */}
          <div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-gray-50 hover:bg-gray-100 text-gray-800 p-10 rounded-3xl font-bold transition shadow-sm flex flex-col items-center gap-4 border-2 border-dashed border-gray-300 group"
            >
              <div className="bg-blue-100 text-blue-600 p-4 rounded-full group-hover:scale-110 transition-transform">
                <Upload size={32} />
              </div>
              Upload QR Image Dokumen
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Divider */}
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
      </div>

      <div className="mt-8 text-center text-sm text-gray-400">
        <p>
          Akses verifikasi ini bersifat publik dan tidak memerlukan registrasi akun.
        </p>
      </div>
    </div>
  );
}