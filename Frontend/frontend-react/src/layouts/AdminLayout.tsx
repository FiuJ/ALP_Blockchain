import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  LogOut,
  Menu,
  X,
  Wallet,
  User,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { address, disconnectWallet } = useWallet();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Helper untuk memotong wallet address
  const formatAddress = (addr: string) =>
    `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;

  // Helper untuk menentukan menu aktif
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-800">
      {/* ==================== NAVBAR ==================== */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Bagian Kiri: Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-600 rounded-lg">
                <ShieldAlert size={24} className="text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 tracking-tight hidden sm:block">
                Web3Med Admin
              </span>
            </div>

            {/* Bagian Tengah: Menu Navigasi Desktop */}
            {address && (
              <div className="hidden md:flex items-center space-x-2">
                <Link
                  to="/admin/dashboard"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive("/admin/dashboard")
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <LayoutDashboard size={18} />
                  Verifikasi Pending
                </Link>
                <Link
                  to="/admin/doctors"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive("/admin/doctors")
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Users size={18} />
                  Data Dokter
                </Link>

                <Link
                  to="/admin/patients"
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    isActive("/admin/patients")
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <User size={18} />
                  Data Pasien
                </Link>
              </div>
            )}

            {/* Bagian Kanan: Wallet Info & Logout */}
            <div className="hidden md:flex items-center gap-4">
              {address ? (
                <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 px-4 py-1.5 rounded-full">
                  <Wallet size={16} className="text-gray-400" />
                  <span className="text-sm font-mono font-bold text-gray-700">
                    {formatAddress(address)}
                  </span>
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

            {/* Tombol Menu Mobile */}
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

        {/* Menu Mobile Dropdown */}
        {isMobileMenuOpen && address && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2 shadow-lg">
            <Link
              to="/admin/dashboard"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive("/admin/dashboard")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600"
              }`}
            >
              <LayoutDashboard size={20} /> Verifikasi Pending
            </Link>
            <Link
              to="/admin/doctors"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold ${
                isActive("/admin/doctors")
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600"
              }`}
            >
              <Users size={20} /> Master Data Dokter
            </Link>
            <button
              onClick={() => {
                disconnectWallet();
                setIsMobileMenuOpen(false);
              }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full text-left mt-4 border-t border-gray-100"
            >
              <LogOut size={20} /> Disconnect Wallet
            </button>
          </div>
        )}
      </nav>

      {/* ==================== MAIN CONTENT ==================== */}
      <main className="flex-grow flex flex-col">{children}</main>

      {/* ==================== FOOTER ==================== */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <ShieldAlert size={20} className="text-gray-400" />
            <span className="text-sm text-gray-500 font-medium">
              Administrator Portal Level 2
            </span>
          </div>

          <p className="text-sm text-gray-400 text-center">
            &copy; {new Date().getFullYear()} Web3 Medical Verification. All
            rights reserved.
          </p>

          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-400 hover:text-indigo-600 font-medium transition-colors"
            >
              Documentation
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-indigo-600 font-medium transition-colors"
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
