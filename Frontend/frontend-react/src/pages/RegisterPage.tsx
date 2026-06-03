import React, { useState } from 'react';

const RegisterDoctorPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    licenseNumber: '',
    specialization: 'Umum',
    clinicName: '',
    clinicLocation: ''
  });

  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();
    // 1. Panggil fungsi Smart Contract: contract.write.registerDoctor(...)
    // 2. Jika sukses, panggil Backend API: axios.post('/api/doctors/register', formData)
    // 3. Redirect ke Dashboard
    console.log("Mendaftarkan dokter ke Blockchain dan Database...", formData);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Lengkapi Profil Dokter</h2>
        <p className="text-gray-600 mb-6 text-sm">
          Wallet Anda terhubung, namun kami memerlukan detail SIP Anda untuk disimpan di Smart Contract.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap (dengan gelar)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="dr. Budi Santoso"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SIP (Surat Izin Praktik)</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="1234/SIP-DS/2026"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Spesialisasi</label>
              <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option>Umum</option>
                <option>Mata</option>
                <option>THT</option>
                <option>Gigi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kota Praktik</label>
              <input 
                type="text" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Surabaya"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Klinik / Rumah Sakit</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="RS Sejahtera"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition mt-4"
          >
            Daftar & Tanda Tangani Transaksi
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDoctorPage;