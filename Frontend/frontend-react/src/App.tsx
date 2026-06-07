import { Routes, Route } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

// Import Pages (Pastikan Anda membuat file-file ini)
import LandingPage from "./pages/LandingPage";
import OnboardingPage from "./pages/OnboardingPage";
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import IssueDocument from "./pages/IssueDocument";
import PatientDashboard from "./pages/PatientDashboard";
import ScannerPage from "./pages/ScannerPage";
import VerifyResultPage from "./pages/VerifyResultPage";

function App() {
  return (
    <Routes>
      {/* A. Halaman Publik */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/onboarding" element={<MainLayout><OnboardingPage /></MainLayout>} />

      {/* B. Portal Admin */}
      <Route path="/admin/dashboard" element={<MainLayout><AdminDashboard /></MainLayout>} />

      {/* C. Portal Dokter */}
      <Route path="/doctor/dashboard" element={<MainLayout><DoctorDashboard /></MainLayout>} />
      <Route path="/doctor/issue-document" element={<MainLayout><IssueDocument /></MainLayout>} />
      
      {/* D. Portal Pasien */}
      <Route path="/patient/dashboard" element={<MainLayout><PatientDashboard /></MainLayout>} />

      {/* E. Portal Verifikator (HRD/Publik) */}
      <Route path="/verify" element={<MainLayout><ScannerPage /></MainLayout>} />
      <Route path="/verify/result/:documentHash" element={<MainLayout><VerifyResultPage /></MainLayout>} />
    </Routes>
  );
}

export default App;