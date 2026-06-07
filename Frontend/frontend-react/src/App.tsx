import { Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import VerifyPage from "./pages/VerifyPage";
import LandingPage from "./pages/LandingPage";
import RegisterDoctorPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterDoctorPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* <Route path="/upload" element={<UploadPage />} /> */}

      <Route path="/verify" element={<VerifyPage />} />
      <Route path="/profile" element={<ProfilePage />} />
    </Routes>
  );
}

export default App;
