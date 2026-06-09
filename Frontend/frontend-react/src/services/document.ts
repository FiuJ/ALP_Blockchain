import { BASE_URL } from "./config";

export const getDashboardStats = async (walletAddress: string) => {
  const response = await fetch(`${BASE_URL}/dashboard/stats`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": walletAddress,
    },
  });

  if (!response.ok) {
    console.warn("Endpoint backend belum tersedia, menampilkan data dummy.");
    return {
      stats: { total: 5, verified: 4, revoked: 1 },
      documents: [
        {
          patient: "Budi Santoso",
          doctor: "dr. Andi",
          status: "Verified",
          createdAt: "2026-06-07T10:00:00Z",
        },
        {
          patient: "Siti Aminah",
          doctor: "dr. Andi",
          status: "Revoked",
          createdAt: "2026-06-06T14:30:00Z",
        },
      ],
    };
  }
  const result = await response.json();
  return result.data;
};

export const getDoctorDocuments = async (walletAddress: string) => {
  const response = await fetch(
    `${BASE_URL}/documents/doctor/${walletAddress}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
    },
  );
  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Gagal memuat riwayat dokumen.");
  return result.data;
};

export const getPatientDocuments = async (walletAddress: string) => {
  const response = await fetch(
    `${BASE_URL}/documents/patient`, // 👈 Hapus /${walletAddress} di sini
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress, // 👈 Backend akan membaca dari sini!
      },
    },
  );

  const result = await response.json();
  if (!response.ok)
    throw new Error(result.message || "Gagal memuat brankas dokumen.");

  return result.data;
};
export const createDraft = async (
  doctorWallet: string,
  payload: {
    patientWallet: string;
    documentType: string;
    documentDescription: string;
   
  },
) => {
  const response = await fetch(`${BASE_URL}/documents/draft`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": doctorWallet,
    },
    body: JSON.stringify(payload),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Gagal membuat draf dokumen.");
  return data;
};

export const finalizeDocument = async (
  doctorWallet: string,
  payload: {
    tokenId: string;
    documentHash: string;
    filePath: string;
    documentType: string;
    documentDescription: string;
    patientWallet: string;
    restDays: number; // 👈 TAMBAHKAN INI
  },
) => {
  const response = await fetch(`${BASE_URL}/documents/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-wallet-address": doctorWallet,
    },
    body: JSON.stringify(payload), // Payload sekarang berisi data lengkap
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Gagal melakukan finalisasi dokumen.");
  return data;
};

export const verifyDocument = async (documentHash: string) => {
  const response = await fetch(`${BASE_URL}/documents/verify/${documentHash}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.message || "Gagal memverifikasi dokumen.");
  return data;
}
