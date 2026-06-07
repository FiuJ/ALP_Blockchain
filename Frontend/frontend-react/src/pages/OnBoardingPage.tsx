import { useState } from 'react';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';
import { User, Stethoscope, ArrowRight } from 'lucide-react';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const [role, setRole] = useState<'patient' | 'doctor' | null>(null);
  const [formData, setFormData] = useState({ name: '', licenseNumber: '', specialization: '', nik: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected) return alert("Connect wallet terlebih dahulu!");
    setIsLoading(true);

    try {
      if (role === 'doctor') {
        // 1. SC: await writeContractAsync({ functionName: 'registerDoctor', ... })
        // 2. API Backend
        await axios.post('http://localhost:3000/api/doctors/register', { ...formData, walletAddress: address });
        alert("Pendaftaran Dokter Berhasil! Menunggu verifikasi Admin.");
        navigate('/doctor/dashboard');
      } else {
        // 1. SC: await writeContractAsync({ functionName: 'registerPatient', ... })
        // 2. API Backend
        await axios.post('http://localhost:3000/api/patients/register', { name: formData.name, walletAddress: address });
        alert("Pendaftaran Pasien Berhasil!");
        navigate('/patient/dashboard');
      }
    } catch (error) {
      console.error(error);
      alert("Registrasi gagal.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!role) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Pilih Peran Anda</h1>
        <div className="grid md:grid-cols-2 gap-8">
          <button onClick={() => setRole('patient')} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-lg transition group">
            <User size={64} className="mx-auto text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Saya Pasien</h2>
            <p className="text-gray-500">Menerima dan menyimpan surat sakit secara digital.</p>
          </button>
          <button onClick={() => setRole('doctor')} className="bg-white p-10 rounded-3xl shadow-sm border border-gray-200 hover:border-blue-500 hover:shadow-lg transition group">
            <Stethoscope size={64} className="mx-auto text-blue-600 mb-6 group-hover:scale-110 transition-transform" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Saya Dokter</h2>
            <p className="text-gray-500">Menerbitkan surat medis resmi berteknologi blockchain.</p>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          {role === 'doctor' ? <Stethoscope className="text-blue-600"/> : <User className="text-blue-600"/>}
          Registrasi {role === 'doctor' ? 'Dokter' : 'Pasien'}
        </h2>
        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
            <input type="text" required className="w-full px-5 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
              onChange={(e) => setFormData({...formData, name: e.target.value})} />
          </div>
          {role === 'doctor' && (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor SIP (Lisensi)</label>
                <input type="text" required className="w-full px-5 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Spesialisasi</label>
                <input type="text" required className="w-full px-5 py-3 rounded-full border border-gray-200 focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
              </div>
            </>
          )}
          <button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-full shadow-md transition flex items-center justify-center gap-2 mt-4">
            {isLoading ? 'Memproses...' : 'Daftar Sekarang'} <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}