
import prisma from '../config/prisma';
import { RegisterDoctorDto } from '../interfaces/doctor.interface';

export const registerDoctorService = async (data: RegisterDoctorDto) => {
  // 1. Cek apakah Wallet Address sudah terdaftar
  const existingWallet = await prisma.doctor.findUnique({
    where: { walletAddress: data.walletAddress },
  });
  if (existingWallet) {
    throw new Error('Wallet address ini sudah terdaftar di sistem.');
  }

  // 2. Cek apakah Nomor SIP sudah dipakai orang lain
  const existingLicense = await prisma.doctor.findUnique({
    where: { doctorLicenseNumber: data.doctorLicenseNumber },
  });
  if (existingLicense) {
    throw new Error('Nomor SIP ini sudah terdaftar. Harap hubungi admin jika ini kesalahan.');
  }

  // 3. Simpan ke database (isVerified otomatis false dari Prisma Schema)
  const newDoctor = await prisma.doctor.create({
    data: {
      walletAddress: data.walletAddress,
      name: data.name,
      doctorLicenseNumber: data.doctorLicenseNumber,
      specialization: data.specialization,
      clinicName: data.clinicName,
      clinicLocation: data.clinicLocation,
      // isVerified tidak perlu dimasukkan karena default-nya false
    },
  });

  return newDoctor;
};