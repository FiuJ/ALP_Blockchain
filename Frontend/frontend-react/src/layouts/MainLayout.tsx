// src/layouts/MainLayout.tsx
import { Link } from "react-router-dom";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { injected } from "wagmi/connectors";
import { Activity, Wallet } from "lucide-react";

function MainLayout({ children }: any) {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  // Helper: Mendeteksi peran dari localStorage (yang kita set di LandingPage/Login)
  const role = localStorage.getItem('userRole'); 

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <Link to="/" className="flex items-center gap-2 text-blue-600 hover:opacity-90 transition">
          <Activity size={28} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight">MediChain</span>
        </Link>

        {/* Dinamis Link berdasarkan Role */}
        <div className="hidden md:flex gap-6 font-medium text-gray-600">
          {role === 'doctor' && (
            <>
              <Link to="/doctor/dashboard" className="hover:text-blue-600 transition">Dashboard Dokter</Link>
              <Link to="/doctor/issue-document" className="hover:text-blue-600 transition">Terbitkan Surat</Link>
            </>
          )}
          {role === 'patient' && (
            <Link to="/patient/dashboard" className="hover:text-blue-600 transition">Brankas Medis</Link>
          )}
          {role === 'admin' && (
            <Link to="/admin/dashboard" className="hover:text-blue-600 transition">Verifikasi Dokter</Link>
          )}
          
          {/* Link Publik */}
          <Link to="/verify" className="hover:text-blue-600 transition">Cek Dokumen</Link>
        </div>

        {isConnected ? (
          <button 
            onClick={() => { disconnect(); localStorage.clear(); window.location.href = '/'; }}
            className="border border-red-200 bg-red-50 text-red-600 px-5 py-2 rounded-full font-medium hover:bg-red-100 transition shadow-sm text-sm"
          >
            Disconnect ({address?.substring(0, 6)}...)
          </button>
        ) : (
          <button 
            onClick={() => connect({ connector: injected() })}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition shadow-md flex items-center gap-2 text-sm"
          >
            <Wallet size={16} /> Connect Wallet
          </button>
        )}
      </nav>

      <div className="p-8 max-w-7xl mx-auto">
        {children}
      </div>
    </div>
  );
}

export default MainLayout;