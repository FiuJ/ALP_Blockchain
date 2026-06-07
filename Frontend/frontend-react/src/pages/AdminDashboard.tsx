import { useState, useEffect } from 'react';
import axios from 'axios';
import { CheckCircle, Clock, ShieldCheck } from 'lucide-react';
// import { useWriteContract } from 'wagmi'; // Diperlukan untuk panggil Smart Contract

export default function AdminDashboard() {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fungsi untuk mengambil semua dokter saat komponen dimuat
  const fetchDoctors = async () => {
    try {
      // GET /api/doctors
      const res = await axios.get('http://localhost:3000/api/doctors');
      setDoctors(res.data);
    } catch (error) {
      console.error('Gagal mengambil data dokter:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerify = async (walletAddress: string) => {
    try {
      // ===== 1. TRANSAKSI SMART CONTRACT (Blockchain) =====
      // Ingat: Admin harus melakukan transaksi di DoctorRegistry.sol terlebih dahulu!
      // await writeContractAsync({ 
      //   abi: DoctorRegistryABI, 
      //   address: CONTRACT_ADDRESS, 
      //   functionName: 'verifyDoctor', 
      //   args: [walletAddress] 
      // });
      
      // ===== 2. SINKRONISASI BACKEND (MySQL) =====
      // PATCH /api/admin/doctors/:walletAddress/verify
      await axios.patch(`http://localhost:3000/api/admin/doctors/${walletAddress}/verify`);
      
      alert('Dokter berhasil diverifikasi di Blockchain dan Database!');
      
      // Segarkan ulang tabel agar status "Pending" berubah menjadi "Verified"
      fetchDoctors();
    } catch (error) {
      console.error('Verifikasi gagal:', error);
      alert('Terjadi kesalahan saat memverifikasi dokter.');
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto bg-slate-50 min-h-screen">
      <div className="flex items-center gap-3 mb-8">
        <ShieldCheck className="text-blue-600 w-10 h-10" />
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Admin Portal</h1>
          <p className="text-slate-500">Manajemen & Verifikasi Dokter</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
              <th className="p-4 font-medium">Nama Dokter</th>
              <th className="p-4 font-medium">Spesialisasi</th>
              <th className="p-4 font-medium">No. Lisensi (IDI)</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="text-center p-6 text-slate-500">Memuat data...</td></tr>
            ) : doctors.length === 0 ? (
              <tr><td colSpan={5} className="text-center p-6 text-slate-500">Belum ada dokter terdaftar.</td></tr>
            ) : (
              doctors.map((doc) => (
                <tr key={doc.walletAddress} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-medium text-slate-800">{doc.name}</td>
                  <td className="p-4 text-slate-600">{doc.specialization}</td>
                  <td className="p-4 text-slate-600">{doc.licenseNumber}</td>
                  <td className="p-4">
                    {doc.isVerified ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                        <CheckCircle size={14} /> Terverifikasi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-medium">
                        <Clock size={14} /> Menunggu
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    {!doc.isVerified && (
                      <button 
                        onClick={() => handleVerify(doc.walletAddress)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-md shadow-blue-200"
                      >
                        Verifikasi Dokter
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}