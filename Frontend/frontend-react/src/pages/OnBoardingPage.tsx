import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../hooks/useRegisterMutation";
import {
  Stethoscope,
  User,
  CreditCard,
  Activity,
  Building2,
  Wallet,
  Loader2,
  ShieldCheck,
  ArrowLeft,
} from "lucide-react";

export default function OnboardingPage() {
  const navigate = useNavigate();
  const registerMutation = useRegisterMutation();

  // State dimulai dengan null agar halaman Onboarding muncul pertama kali
  const [role, setRole] = useState<"doctor" | "patient" | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    idNumber: "",
    specialization: "",
    clinicName: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!role) return;

    registerMutation.mutate(
      { role, formData },
      {
        onSuccess: () => {
          alert(
            "🎉 Registrasi berhasil disinkronkan ke Blockchain & Database!",
          );
          localStorage.setItem("userRole", role);
          
          // 👇 PERBAIKAN: Arahkan ke dashboard sesuai role
          if (role === "doctor") {
            navigate("/doctor/dashboard");
          } else if (role === "patient") {
            navigate("/patient/dashboard");
          }
        },
        onError: (error: any) => {
          alert(`Gagal: ${error.message || "Terjadi kesalahan sistem"}`);
        },
      },
    );
  };

  // ==========================================
  // TAMPILAN 1: HALAMAN ONBOARDING (PILIH PERAN)
  // ==========================================
  if (!role) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
        <div className="max-w-4xl mx-auto py-12 text-center w-full animate-in fade-in zoom-in-95 duration-500">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-blue-600 rounded-full shadow-lg shadow-blue-200">
              <ShieldCheck size={48} className="text-white" />
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            Sistem Medis Web3
          </h1>
          <p className="text-gray-500 mb-12 text-lg">
            Pilih peran Anda untuk memulai registrasi identitas desentralisasi
          </p>

          <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
            {/* Tombol Card: Pasien */}
            <button
              onClick={() => setRole("patient")}
              className="bg-white p-10 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-blue-50 w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <User size={48} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Saya Pasien
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed px-4">
                Menerima, menyimpan, dan mengelola rekam medis serta surat sakit
                secara digital dan aman.
              </p>
            </button>

            {/* Tombol Card: Dokter */}
            <button
              onClick={() => setRole("doctor")}
              className="bg-white p-10 rounded-[2rem] shadow-sm border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all group duration-300 transform hover:-translate-y-2"
            >
              <div className="bg-blue-50 w-24 h-24 mx-auto rounded-full flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-100 transition-all duration-300">
                <Stethoscope size={48} className="text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Saya Dokter
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed px-4">
                Menerbitkan surat medis resmi berteknologi blockchain yang
                tervalidasi dan tidak dapat dipalsukan.
              </p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TAMPILAN 2: FORM REGISTRASI (SETELAH MEMILIH PERAN)
  // ==========================================
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 font-sans text-gray-800">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-8 fade-in duration-500">
        {/* Header Form */}
        <div className="bg-blue-600 px-8 py-6 text-white text-center relative">
          {/* Tombol Kembali ke Pemilihan Peran */}
          <button
            type="button"
            onClick={() => setRole(null)}
            className="absolute left-6 top-6 text-blue-200 hover:text-white transition-colors flex items-center gap-1.5 text-sm font-medium"
          >
            <ArrowLeft size={16} /> Batal
          </button>

          <div className="flex justify-center mb-3 mt-4">
            <div className="p-3 bg-blue-500 rounded-full shadow-inner">
              {role === "doctor" ? (
                <Stethoscope size={32} className="text-white" />
              ) : (
                <User size={32} className="text-white" />
              )}
            </div>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Registrasi {role === "doctor" ? "Dokter" : "Pasien"}
          </h2>
          <p className="text-blue-100 text-sm mt-1">
            Lengkapi data identitas Web3 Anda
          </p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <User size={18} />
              </div>
              <input
                name="name"
                placeholder="Nama Lengkap"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <CreditCard size={18} />
              </div>
              <input
                name="idNumber"
                placeholder={
                  role === "doctor" ? "Nomor SIP" : "NIK / Rekam Medis"
                }
                value={formData.idNumber}
                onChange={handleInputChange}
                required
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
              />
            </div>

            {role === "doctor" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Activity size={18} />
                  </div>
                  <input
                    name="specialization"
                    placeholder="Spesialisasi (Contoh: Penyakit Dalam)"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
                  />
                </div>

                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <Building2 size={18} />
                  </div>
                  <input
                    name="clinicName"
                    placeholder="Nama Klinik / Rumah Sakit"
                    value={formData.clinicName}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white outline-none transition-all duration-200"
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={registerMutation.isPending}
              className={`w-full flex items-center justify-center gap-2 py-4 px-4 rounded-xl font-bold text-white transition-all duration-300 shadow-md mt-8 ${
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