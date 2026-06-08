import { registerDoctor, registerPatient, getProfile } from "./auth";
import {
  getPendingDoctors,
  verifyDoctor,
  getAllDoctorsAdmin,
  getAllPatientsAdmin,
} from "./admin";
import {
  getDashboardStats,
  getDoctorDocuments,
  getPatientDocuments,
} from "./document";
// Export interface jika dibutuhkan komponen lain
export type { DoctorData, PatientData } from "./config";

// Bungkus kembali menjadi satu objek apiService
export const apiService = {
  registerDoctor,
  registerPatient,
  getProfile,
  getPendingDoctors,
  verifyDoctor,
  getAllDoctorsAdmin,
  getAllPatientsAdmin,
  getDashboardStats,
  getDoctorDocuments,
  getPatientDocuments,
};
