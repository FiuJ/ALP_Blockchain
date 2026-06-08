import { useMutation } from '@tanstack/react-query';
import { createWalletClient, createPublicClient, custom } from 'viem';
import { hardhat } from 'viem/chains'; // Ganti ke sepolia/mainnet saat production
// import { apiService, type DoctorData, type PatientData } from '../services/api';
import { PATIENT_REGISTRY_ADDRESS, patientRegistryABI } from '../config/PatientRegistryContract';
import { DOCTOR_REGISTRY_ADDRESS, doctorRegistryABI } from '../config/DoctorRegistryContractConfig';
import { apiService, type DoctorData, type PatientData } from '../services';


declare global {
  interface Window {
    ethereum?: any;
  }
}

type RegisterVariables = {
  role: "doctor" | "patient";
  formData: any; // Akan di-casting sesuai role nanti
};

export const useRegisterMutation = () => {
  return useMutation({
    mutationFn: async ({ role, formData }: RegisterVariables) => {
      if (!window.ethereum) throw new Error("Wallet tidak ditemukan. Silakan install MetaMask/Rabby.");

      // 1. Setup Viem Clients
      const walletClient = createWalletClient({
        chain: hardhat,
        transport: custom(window.ethereum)
      });
      const publicClient = createPublicClient({
        chain: hardhat,
        transport: custom(window.ethereum)
      });

      // 2. Dapatkan akun yang terkoneksi
      const [address] = await walletClient.requestAddresses();

      // 3. Eksekusi Smart Contract sesuai Role
      let hash;
      if (role === "doctor") {
        hash = await walletClient.writeContract({
          address: DOCTOR_REGISTRY_ADDRESS,
          abi: doctorRegistryABI,
          functionName: 'registerDoctor',
          account: address,
        });
      } else {
        hash = await walletClient.writeContract({
          address: PATIENT_REGISTRY_ADDRESS,
          abi: patientRegistryABI,
          functionName: 'registerPatient',
          account: address,
        });
      }

      // 4. Tunggu konfirmasi block (seperti tx.wait() di ethers)
      await publicClient.waitForTransactionReceipt({ hash });

      // 5. Simpan ke Database Backend
      if (role === "doctor") {
        const docData: DoctorData = {
          name: formData.name,
          doctorLicenseNumber: formData.idNumber,
          specialization: formData.specialization,
          clinicName: formData.clinicName,
          clinicLocation: "Surabaya"
        };
        return await apiService.registerDoctor(address, docData);
      } else {
        const patData: PatientData = {
          name: formData.name,
          patientId: formData.idNumber
        };
        return await apiService.registerPatient(address, patData);
      }
    }
  });
};