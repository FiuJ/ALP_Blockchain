import { BASE_URL, type DoctorData, type PatientData } from "./config";

export const registerDoctor = async (walletAddress: string, doctorData: DoctorData) => {
  const response = await fetch(`${BASE_URL}/doctors/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(doctorData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menyimpan ke database");
  return data;
};

export const registerPatient = async (walletAddress: string, patientData: PatientData) => {
  const response = await fetch(`${BASE_URL}/patients/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
    body: JSON.stringify(patientData),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Gagal menyimpan ke database");
  return data;
};

export const getProfile = async (walletAddress: string, role: "doctor" | "patient") => {
  const endpoint = role === "doctor" ? `/doctors/${walletAddress}` : `/patients/${walletAddress}`;
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal mengambil data profil");
  return result.data;
};