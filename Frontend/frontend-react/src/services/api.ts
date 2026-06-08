const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export interface DoctorData {
  name: string;
  doctorLicenseNumber: string;
  specialization: string;
  clinicName: string;
  clinicLocation: string;
}

export interface PatientData {
  name: string;
  patientId: string;
}

export const apiService = {
  registerDoctor: async (walletAddress: string, doctorData: DoctorData) => {
    const response = await fetch(`${BASE_URL}/doctors/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify(doctorData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Gagal menyimpan ke database");
    return data;
  },

  registerPatient: async (walletAddress: string, patientData: PatientData) => {
    const response = await fetch(`${BASE_URL}/patients/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
      body: JSON.stringify(patientData),
    });
    const data = await response.json();
    if (!response.ok)
      throw new Error(data.message || "Gagal menyimpan ke database");
    return data;
  },

  getProfile: async (walletAddress: string, role: "doctor" | "patient") => {
    // Sesuaikan URL berdasarkan role
    const endpoint =
      role === "doctor"
        ? `/doctors/${walletAddress}`
        : `/patients/${walletAddress}`;

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress, // Wajib disertakan untuk menembus Middleware Level 1
      },
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Gagal mengambil data profil");

    return result.data; // Asumsi backend Anda mengirimkan data di dalam properti "data"
  },

  getDashboardStats: async (walletAddress: string) => {
    // TODO: Sesuaikan endpoint ini dengan rute backend buatan Matthew nantinya
    const response = await fetch(`${BASE_URL}/dashboard/stats`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress,
      },
    });

    if (!response.ok) {
      // Jika endpoint backend belum jadi, kita kembalikan data dummy sementara
      // agar UI frontend tetap bisa dilihat hasilnya
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
  },

  getPendingDoctors: async (adminWalletAddress: string) => {
    const response = await fetch(`${BASE_URL}/admin/doctors/pending`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": adminWalletAddress,
      },
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Akses Ditolak: Anda bukan Admin.");
    return result.data;
  },

  // [ADMIN] Memverifikasi dokter
  verifyDoctor: async (
    adminWalletAddress: string,
    doctorWalletAddress: string,
  ) => {
    const response = await fetch(
      `${BASE_URL}/admin/doctors/${doctorWalletAddress}/verify`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-wallet-address": adminWalletAddress,
        },
      },
    );

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Gagal memverifikasi dokter.");
    return result.data;
  },
  // [ADMIN] Mengambil SEMUA data dokter (Master Data)
  getAllDoctorsAdmin: async (adminWalletAddress: string) => {
    const response = await fetch(`${BASE_URL}/admin/doctors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": adminWalletAddress,
      },
    });

    const result = await response.json();
    if (!response.ok)
      throw new Error(result.message || "Akses Ditolak: Anda bukan Admin.");
    return result.data;
  },

  // [ADMIN] Mengambil SEMUA data pasien
  getAllPatientsAdmin: async (adminWalletAddress: string) => {
    const response = await fetch(`${BASE_URL}/admin/patients`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": adminWalletAddress 
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Akses Ditolak: Anda bukan Admin.");
    return result.data;
  },

  getDoctorDocuments: async (walletAddress: string) => {
    // Sesuaikan URL ini dengan route backend yang dibuat Matthew
    const response = await fetch(`${BASE_URL}/documents/doctor/${walletAddress}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-wallet-address": walletAddress 
      }
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Gagal memuat riwayat dokumen.");
    return result.data; 
  },
};
