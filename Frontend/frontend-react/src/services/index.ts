import { registerDoctor, registerPatient, getProfile, getAllPatients } from "./auth";
import {
  getPendingDoctors,
  verifyDoctor,
  getAllDoctorsAdmin,
  getAllPatientsAdmin,
} from "./admin";
import {
    createDraft,
    finalizeDocument,
  getDashboardStats,
  getDoctorDocuments,
  getPatientDocuments,
  verifyDocument,
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
  createDraft,
  finalizeDocument,
  getAllPatients,
  verifyDocument
};
