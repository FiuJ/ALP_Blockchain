import React, { useState } from "react";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import { useNavigate } from "react-router-dom"; // 1. Import useNavigate
import { 
  Stethoscope, 
  User, 
  CreditCard, 
  Activity, 
  Building2, 
  Wallet, 
  Loader2, 
  ShieldCheck 
} from "lucide-react";

export default function RegisterPage() {
  const [role, setRole] = useState<"doctor" | "patient">("doctor");
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    specialization: "",
    clinicName: ""
  });

  const registerMutation = useRegisterMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    registerMutation.mutate({ role, formData }, {
      onSuccess: () => {
        alert("🎉 Registrasi berhasil disinkronkan ke Blockchain & Database!");
        localStorage.setItem("userRole", role);
        navigate("/profile");
        // window.location.href = role === "doctor" ? "/doctor/dashboard" : "/patient/dashboard";
      },
      onError: (error: any) => {
        // alert(`Gagal: ${error.message || "Terjadi kesalahan"}`);
      }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-600 px-8 py-6 text-white text-center">
          <div className="flex justify-center mb-3">
            <div className="p-3 bg-blue-500 rounded-full">
              <ShieldCheck size={32} className="text-white" />
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">Sistem Medis Web3</h2>
          <p className="text-blue-100 text-sm mt-1">Registrasi identitas desentralisasi Anda</p>
        </div>

        <div className="p-8">
          {/* Custom Role Selector */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <button
              type="button"
              onClick={() => setRole("doctor")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                role === "doctor" 
                  ? "border-blue-600 bg-blue-50 text-blue-700" 
                  : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Stethoscope size={28} className="mb-2" />
              <span className="font-semibold text-sm">Saya Dokter</span>
            </button>

            <button
              type="button"
              onClick={() => setRole("patient")}
              className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 ${
                role === "patient" 
                  ? "border-blue-600 bg-blue-50 text-blue-700" 
                  : "border-gray-100 text-gray-500 hover:border-gray-200 hover:bg-gray-50"
              }`}
            >
              <User size={28} className="mb-2" />
              <span className="font-semibold text-sm">Saya Pasien</span>
            </button>
          </div>

          {/* Form Inputs */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nama Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input 
                name="name" 
                placeholder="Nama Lengkap" 
                value={formData.name} 
                onChange={handleInputChange} 
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
              />
            </div>

            {/* ID Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <CreditCard size={18} />
              </div>
              <input 
                name="idNumber" 
                placeholder={role === "doctor" ? "Nomor SIP" : "NIK / Rekam Medis"} 
                value={formData.idNumber} 
                onChange={handleInputChange} 
                required 
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
              />
            </div>
            
            {/* Tambahan Khusus Dokter */}
            {role === "doctor" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Activity size={18} />
                  </div>
                  <input 
                    name="specialization" 
                    placeholder="Spesialisasi (Contoh: Umum)" 
                    value={formData.specialization} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Building2 size={18} />
                  </div>
                  <input 
                    name="clinicName" 
                    placeholder="Nama Klinik / Rumah Sakit" 
                    value={formData.clinicName} 
                    onChange={handleInputChange} 
                    required 
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={registerMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-white transition-all duration-200 shadow-md mt-6 ${
                registerMutation.isPending 
                  ? "bg-blue-400 cursor-not-allowed" 
                  : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-[0.98]"
              }`}
            >
              {registerMutation.isPending ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Memproses Transaksi...</span>
                </>
              ) : (
                <>
                  <Wallet size={20} />
                  <span>Connect Wallet & Register</span>
                </>
              )}
            </button>
          </form>
          
        </div>
      </div>
    </div>
  );
}