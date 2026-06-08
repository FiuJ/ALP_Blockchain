import { PrismaClient } from '@prisma/client';
import { IDoctorRegister } from '../interfaces/doctor.interface';

const prisma = new PrismaClient();

export class DoctorService {
  // Simpan data pendaftaran dokter
  static async registerDoctor(data: IDoctorRegister) {
    // Cek apakah wallet sudah terdaftar
    const existingDoctor = await prisma.doctor.findUnique({
      where: { walletAddress: data.walletAddress },
    });

    if (existingDoctor) {
      throw new Error('Wallet address dokter ini sudah terdaftar di database.');
    }

    // Simpan ke database dengan default isVerified = false
    const newDoctor = await prisma.doctor.create({
      data: {
        walletAddress: data.walletAddress,
        name: data.name,
        doctorLicenseNumber: data.doctorLicenseNumber,
        specialization: data.specialization,
        clinicName: data.clinicName,
        clinicLocation: data.clinicLocation,
        isVerified: false, 
      },
    });

    return newDoctor;
  }

  // Ambil semua profil dokter (Bisa ditambah filter spesialisasi jika perlu)
  static async getAllDoctors() {
    return await prisma.doctor.findMany();
  }

  // Ambil profil satu dokter saat login
  static async getDoctorByWallet(walletAddress: string) {
    return await prisma.doctor.findUnique({
      where: { walletAddress },
    });
  }

  // Fungsi tambahan untuk admin memverifikasi dokter
  static async verifyDoctor(walletAddress: string) {
    const doctor = await prisma.doctor.findUnique({
      where: { walletAddress },
    });

    if (!doctor) {
      throw new Error('Dokter tidak ditemukan');
    }

    return await prisma.doctor.update({
      where: { walletAddress },
      data: { isVerified: true },
    });
  }

  
}