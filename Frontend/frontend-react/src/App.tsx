import { Routes, Route } from "react-router-dom"
import LoginPage from "./pages/LoginPage"
import DashboardPage from "./pages/DashboardPage"
import UploadPage from "./pages/UploadPage"
import VerifyPage from "./pages/VerifyPage"

function App() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* <Route path="/upload" element={<UploadPage />} /> */}
      <Route path="/verify" element={<VerifyPage />} />
    </Routes>
  )
}

export default App