import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import { useQuery } from "@tanstack/react-query";
import { apiService } from "../services/api";
import { 
  HeartPulse, 
  FolderHeart, 
  LogOut, 
  Menu, 
  X,
  Wallet,
  User,
  ShieldAlert // Tambahkan ikon ini
} from "lucide-react";

interface PatientLayoutProps {
  children: React.ReactNode;
}

export default function PatientLayout({ children }: PatientLayoutProps) {
  const { address, disconnectWallet } = useWallet();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tarik isError dan error dari useQuery
  const { data: profile, isError, error } = useQuery({
    queryKey: ["patientProfile", address],
    queryFn: () => apiService.getProfile(address as string, "patient"),
    enabled: !!address,
    staleTime: Infinity,
    retry: false // Jangan diulang terus-menerus jika memang bukan pasien
  });

  const formatAddress = (addr: string) => `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg shadow-sm">
                <HeartPulse size={24} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
                Portal Pasien
              </span>
            </div>

            {/* Sembunyikan menu navigasi jika ternyata bukan pasien (isError) */}
            {address && !isError && (
              <div className="hidden md:flex items-center space-x-2">
                <Link 
                  to="/patient/dashboard" 
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive("/patient/dashboard") 
                      ? "bg-emerald-50 text-emerald-700" 
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <FolderHeart size={18} /> Brankas Dokumen
                </Link>
              </div>
            )}

            <div className="hidden md:flex items-center gap-4">
              {address ? (
                <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 pl-2 pr-4 py-1.5 rounded-full">
                  {profile && !isError && (
                    <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100">
                      <User size={14} className="text-emerald-500" />
                      <span className="text-sm font-bold text-gray-700">{profile.name}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Wallet size={16} className="text-gray-400" />
                    <span className="text-sm font-mono font-bold text-gray-600">
                      {formatAddress(address)}
                    </span>
                  </div>
                  <div className="w-px h-4 bg-gray-300 mx-1"></div>
                  <button 
                    onClick={disconnectWallet}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Disconnect Wallet"
                  >
                    <LogOut size={16} />
                  </button>
                </div>
              ) : (
                <span className="text-sm font-medium text-gray-400 bg-gray-100 px-4 py-1.5 rounded-full">
                  Not Connected
                </span>
              )}
            </div>

            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-500 hover:text-gray-900 p-2"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {isMobileMenuOpen && address && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg">
            {!isError && (
              <Link 
                to="/patient/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-700"
              >
                <FolderHeart size={20} /> Brankas Dokumen
              </Link>
            )}
            <button 
              onClick={() => { disconnectWallet(); setIsMobileMenuOpen(false); }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full text-left mt-4 border-t border-gray-100"
            >
              <LogOut size={20} /> Disconnect Wallet
            </button>
          </div>
        )}
      </nav>

      <main className="flex-grow flex flex-col">
        {/* Jika terjadi error (bukan pasien), tampilkan pesan penolakan. Jika aman, tampilkan children */}
        {isError ? (
          <div className="flex-grow flex items-center justify-center p-4">
            <div className="bg-red-50 p-8 rounded-3xl max-w-md w-full text-center border border-red-100 shadow-sm animate-in zoom-in-95 duration-300">
              <ShieldAlert size={56} className="text-red-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-700 mb-2">Akses Ditolak</h2>
              <p className="text-red-600/80 mb-2 text-sm">
                Dompet Web3 ini tidak terdaftar sebagai <strong>Pasien</strong>. 
              </p>
              <p className="text-red-600/70 mb-6 text-xs bg-red-100/50 p-3 rounded-lg border border-red-100">
                {(error as Error).message || "Silakan gunakan portal yang sesuai (Dokter/Admin) atau daftar terlebih dahulu."}
              </p>
              <button
                onClick={disconnectWallet}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2 mx-auto shadow-md hover:shadow-lg active:scale-95 w-full"
              >
                <LogOut size={18} /> Putuskan Koneksi Dompet
              </button>
            </div>
          </div>
        ) : (
          children
        )}
      </main>
    </div>
  );
}