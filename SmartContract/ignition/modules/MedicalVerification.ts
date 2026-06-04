// ignition/modules/MedicalDocumentSystem.js
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("MedicalDocumentSystemModule", (m) => {
  // 1. Deploy Contract Registry (Tidak butuh parameter constructor)
  const doctorRegistry = m.contract("DoctorRegistry");
  const patientRegistry = m.contract("PatientRegistry");

  // 2. Deploy Contract NFT Utama 
  // Memasukkan objek kontrak registry ke dalam array parameter constructor.
  // Hardhat Ignition akan otomatis menerjemahkannya menjadi Contract Address.
  const medicalDocumentNFT = m.contract("MedicalDocumentNFT", [
    doctorRegistry,
    patientRegistry,
  ]);

  // 3. Mendapatkan akun pertama (deployer) yang otomatis menjadi 'owner'
  const deployer = m.getAccount(0);

  // 4. Memanggil fungsi otomatis setelah deploy (Mendaftarkan Dokter)
  // Perhatikan: Fungsi ini sekarang dipanggil pada 'doctorRegistry', bukan kontrak NFT
  const registerAction = m.call(doctorRegistry, "registerDoctor", [
    "Dr. Admin (Deployer)", 
    "SIP-00000", 
    "Sistem Administrator", 
    "Klinik Pusat", 
    "Surabaya"
  ], {
    id: "registerDeployerAsDoctor", // ID unik untuk melacak eksekusi di Ignition
  });

  // 5. Memverifikasi dokter yang baru saja didaftarkan
  m.call(doctorRegistry, "verifyDoctor", [deployer], {
    id: "verifyDeployerDoctor",
    after: [registerAction] // Memastikan verifikasi menunggu registrasi selesai
  });
  
  // Mengembalikan ketiga kontrak agar address-nya bisa dibaca di konsol/frontend
  return { doctorRegistry, patientRegistry, medicalDocumentNFT };
});