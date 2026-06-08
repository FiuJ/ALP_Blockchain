import { BASE_URL } from "./config";

export const getPendingDoctors = async (adminWalletAddress: string) => {
  const response = await fetch(`${BASE_URL}/admin/doctors/pending`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": adminWalletAddress,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Akses Ditolak: Anda bukan Admin.");
  return result.data;
};

export const verifyDoctor = async (adminWalletAddress: string, doctorWalletAddress: string) => {
  const response = await fetch(`${BASE_URL}/admin/doctors/${doctorWalletAddress}/verify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": adminWalletAddress,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Gagal memverifikasi dokter.");
  return result.data;
};

export const getAllDoctorsAdmin = async (adminWalletAddress: string) => {
  const response = await fetch(`${BASE_URL}/admin/doctors`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": adminWalletAddress,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Akses Ditolak: Anda bukan Admin.");
  return result.data;
};

export const getAllPatientsAdmin = async (adminWalletAddress: string) => {
  const response = await fetch(`${BASE_URL}/admin/patients`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": adminWalletAddress,
    },
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.message || "Akses Ditolak: Anda bukan Admin.");
  return result.data;
};