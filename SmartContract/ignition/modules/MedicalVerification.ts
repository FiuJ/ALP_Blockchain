// ignition/modules/MedicalDocumentSystem.js
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MedicalDocumentSystemModule", (m) => {
  // 1. Deploy Contract Registry
  const doctorRegistry = m.contract("DoctorRegistry");
  const patientRegistry = m.contract("PatientRegistry");

  // 2. Deploy Contract NFT Utama
  const medicalDocumentNFT = m.contract("MedicalDocumentNFT", [
    doctorRegistry,
    patientRegistry,
  ]);

  // 3. Mendapatkan akun pertama (deployer)
  const deployer = m.getAccount(0);

  // 4. Memanggil registerDoctor TANPA parameter
  const registerAction = m.call(doctorRegistry, "registerDoctor", [], {
    id: "registerDeployerAsDoctor", 
  });

  // 5. Memverifikasi deployer yang baru saja didaftarkan
  m.call(doctorRegistry, "verifyDoctor", [deployer], {
    id: "verifyDeployerDoctor",
    after: [registerAction] // Pastikan verifikasi berjalan setelah registrasi
  });
  
  return { doctorRegistry, patientRegistry, medicalDocumentNFT };
});