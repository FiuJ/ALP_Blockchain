export const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface DoctorData {
  name: string;
  doctorLicenseNumber: string;
  specialization: string;
  clinicName: string;
  clinicLocation?: string; // Jadikan opsional jika tidak selalu ada
}

export interface PatientData {
  name: string;
  patientId: string;
}