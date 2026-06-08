import { Routes, Route } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LandingPage from "./pages/LandingPage";
import ProfilePage from "./pages/ProfilePage";
import MainLayout from "./layouts/MainLayout";

// Import Pages (Pastikan Anda membuat file-file ini)
import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import IssueDocument from "./pages/IssueDocument";
import PatientDashboard from "./pages/PatientDashboard";
import ScannerPage from "./pages/ScannerPage";
import VerifyResultPage from "./pages/VerifyResultPage";
import OnboardingPage from "./pages/OnboardingPage";
import AdminLayout from "./layouts/AdminLayout";
import AdminAllDoctorsPage from "./pages/AdminAllDoctorPage";
import AdminAllPatientPage from "./pages/AdminAllPatientPage";

function App() {
  return (
    <Routes>
      {/* A. Halaman Publik */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<OnboardingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/verify" element={<VerifyResultPage />} />
      <Route path="/profile" element={<ProfilePage />} />

      {/* B. Portal Admin */}
      <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
      <Route path="/admin/doctors" element={<AdminLayout><AdminAllDoctorsPage /></AdminLayout>} />

      <Route path="/admin/patients" element={<AdminLayout><AdminAllPatientPage /></AdminLayout>} />

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