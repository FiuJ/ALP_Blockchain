import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MedicalDocumentModule", (m) => {
  // 1. Deploy contract MedicalDocumentVerification
  const medicalVerification = m.contract("MedicalDocumentVerification");

  // 2. Mendapatkan akun pertama (deployer) yang otomatis menjadi 'owner' di smart contract
  const deployer = m.getAccount(0);

  // 3. (Opsional) Memanggil fungsi otomatis setelah deploy.
  // Contoh: Mendaftarkan akun deployer sebagai dokter
  const registerAction = m.call(medicalVerification, "registerDoctor", [
    "Dr. Admin (Deployer)", 
    "SIP-00000", 
    "Sistem Administrator", 
    "Klinik Pusat", 
    "Surabaya"
  ], {
    id: "registerDeployerAsDoctor",
  });

  // 4. Memverifikasi dokter yang baru saja didaftarkan
  // Karena deployer adalah owner, dia memiliki hak untuk memanggil verifyDoctor
  m.call(medicalVerification, "verifyDoctor", [deployer], {
    id: "verifyDeployerDoctor",
    after: [registerAction] // Memastikan verifikasi berjalan setelah proses registrasi selesai
  });
  
  return { medicalVerification };
});