import React from "react";
import {
  ShieldCheck,
  FileText,
  Activity,
  Lock,
  Users,
  ArrowRight,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between px-8 py-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2 text-blue-600">
          <Activity size={28} strokeWidth={2.5} />
          <span className="text-xl font-bold tracking-tight">MediChain</span>
        </div>
        <div className="hidden md:flex gap-6 font-medium text-gray-600">
          <a href="#fitur" className="hover:text-blue-600 transition">
            Fitur
          </a>
          <a href="#cara-kerja" className="hover:text-blue-600 transition">
            Cara Kerja
          </a>
          <a href="#verifikasi" className="hover:text-blue-600 transition">
            Cek Dokumen
          </a>
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-full font-medium transition shadow-md flex items-center gap-2">
          <Lock size={16} />
          Connect Wallet
        </button>
      </nav>

      {/* Hero Section */}
      <header className="px-8 py-20 text-center flex flex-col items-center bg-gradient-to-b from-blue-50 to-gray-50">
        <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
          Sistem Verifikasi Berbasis Web3
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight max-w-4xl mb-6">
          Lindungi Integritas <span className="text-blue-600">Surat Medis</span>{" "}
          dengan Teknologi Blockchain
        </h1>
        <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-10">
          Penerbitan surat keterangan sakit digital yang anti-pemalsuan.
          Diverifikasi secara kriptografis melalui jaringan Ethereum untuk rumah
          sakit, pasien, dan HRD perusahaan.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition shadow-lg">
            Terbitkan Surat (Dokter)
          </button>
          <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition flex items-center justify-center gap-2 shadow-sm">
            Verifikasi Dokumen <ArrowRight size={20} />
          </button>

          {/* NAVIGATE TO REGISTER */}
          <Link to="/register">
            <button className="bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 px-8 py-3 rounded-full text-lg font-semibold transition flex items-center justify-center gap-2 shadow-sm">
              Daftar <ArrowRight size={20} />
            </button>
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section id="fitur" className="py-20 px-8 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Keunggulan Sistem Kami
          </h2>
          <p className="text-gray-600">
            Menggabungkan kemudahan Web2 dengan keamanan Web3
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<ShieldCheck size={32} className="text-blue-600" />}
            title="Keamanan Immutable"
            desc="Setiap dokumen di-hash dan disimpan secara permanen di blockchain. Tidak ada yang bisa mengubah isi surat setelah diterbitkan."
          />
          <FeatureCard
            icon={<FileText size={32} className="text-blue-600" />}
            title="Penyimpanan Hibrida"
            desc="File PDF disimpan dengan aman secara off-chain di server lokal, sementara jejak validasi disimpan secara on-chain."
          />
          <FeatureCard
            icon={<Users size={32} className="text-blue-600" />}
            title="Akses Multi-Peran"
            desc="Akses khusus untuk Admin, Dokter terverifikasi, Pasien, dan HRD (Verifier) dengan kontrol berbasis Smart Contract."
          />
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="bg-white py-20 px-8">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">
            Alur Verifikasi dalam 3 Langkah
          </h2>
          <div className="flex flex-col md:flex-row justify-center items-start gap-10">
            <StepCard
              number="1"
              title="Dokter Terverifikasi"
              desc="Dokter mendaftar dan SIP diverifikasi oleh Admin. Setelah valid, dokter dapat mengunggah dan menandatangani surat medis pasien."
            />
            <StepCard
              number="2"
              title="Pencatatan Blockchain"
              desc="Sistem menghasilkan Hash unik dari PDF surat dan mencatatnya ke Smart Contract. Dokumen asli disimpan di server."
            />
            <StepCard
              number="3"
              title="Validasi Pihak Ketiga"
              desc="HRD atau instansi cukup memasukkan ID Dokumen. Sistem akan mencocokkan Hash dengan data di Blockchain secara instan."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-8 text-center">
        <div className="flex items-center justify-center gap-2 text-white mb-4">
          <Activity size={24} />
          <span className="text-xl font-bold">MediChain</span>
        </div>
        <p className="mb-6">
          Sistem Verifikasi Surat Dokter Digital Terdesentralisasi.
        </p>
        <div className="text-sm">
          &copy; {new Date().getFullYear()} Tim Pengembang Web3. All rights
          reserved.
        </div>
      </footer>
    </div>
  );
};

// Sub-components for cleaner code

type FeatureCardProps = {
  icon: React.ReactNode;
  title: string;
  desc: string;
};

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, desc }) => (
  <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
    <div className="bg-blue-50 w-16 h-16 rounded-xl flex items-center justify-center mb-6">
      {icon}
    </div>
    <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
    <p className="text-gray-600 leading-relaxed">{desc}</p>
  </div>
);

type StepCardProps = {
  number: string;
  title: string;
  desc: string;
};

const StepCard: React.FC<StepCardProps> = ({ number, title, desc }) => (
  <div className="flex-1 text-left relative">
    <div className="text-5xl font-black text-blue-100 absolute -top-6 -left-4 z-0">
      {number}
    </div>
    <div className="relative z-10 pl-6 border-l-2 border-blue-200">
      <h4 className="text-xl font-bold text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{desc}</p>
    </div>
  </div>
);

export default LandingPage;
