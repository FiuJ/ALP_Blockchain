import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { User, Activity, Building2, Wallet, ShieldCheck, Loader2 } from "lucide-react";
import { useWallet } from "../hooks/useWallet";

export default function ProfilePage() {
  const { address } = useWallet();
  
  // Ambil role yang disimpan saat register tadi (default ke patient jika tidak ada)
  const role = (localStorage.getItem("userRole") as "doctor" | "patient") || "patient";

  // React Query: Fetching data secara otomatis
  const { data: profileData, isLoading, isError, error } = useQuery({
    queryKey: ["profile", address, role],
    queryFn: () => apiService.getProfile(address as string, role),
    enabled: !!address, // Hanya jalankan query jika wallet sudah terkoneksi
    retry: 1 // Jika 404, jangan retry terus-menerus
  });

  if (!address) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500 font-medium">Harap hubungkan dompet Web3 Anda.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium text-sm">Mengambil data dari Blockchain & Server...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          <p className="font-bold">Gagal memuat profil</p>
          <p className="text-sm mt-1">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans text-gray-800">
      <div className="max-w-2xl mx-auto">
        {/* Header Kartu Identitas */}
        <div className="bg-white rounded-t-2xl p-8 border-b border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10"></div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
              {role === "doctor" ? <Activity size={32} className="text-white" /> : <User size={32} className="text-white" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{profileData?.name}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide ${role === "doctor" ? "bg-indigo-100 text-indigo-700" : "bg-emerald-100 text-emerald-700"}`}>
                  {role === "doctor" ? "Dokter" : "Pasien"}
                </span>
                {role === "doctor" && profileData?.isVerified && (
                   <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full">
                     <ShieldCheck size={14} /> Terverifikasi
                   </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Kartu Identitas */}
        <div className="bg-white rounded-b-2xl p-8 shadow-sm space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <Wallet size={16} /> Wallet Address
              </p>
              <p className="font-mono text-sm bg-gray-50 p-2 rounded-lg break-all border border-gray-100">
                {address}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                <User size={16} /> {role === "doctor" ? "Nomor SIP" : "NIK / ID Pasien"}
              </p>
              <p className="font-semibold text-gray-900">
                {role === "doctor" ? profileData?.doctorLicenseNumber : profileData?.patientId}
              </p>
            </div>

            {role === "doctor" && (
              <>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Activity size={16} /> Spesialisasi
                  </p>
                  <p className="font-semibold text-gray-900">{profileData?.specialization}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                    <Building2 size={16} /> Tempat Praktik
                  </p>
                  <p className="font-semibold text-gray-900">{profileData?.clinicName}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}