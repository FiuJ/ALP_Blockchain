import { PrismaClient } from '@prisma/client';
import { IPatientRegister } from '../interfaces/patient.interface';

const prisma = new PrismaClient();

export class PatientService {
  static async registerPatient(data: IPatientRegister) {
    const existingPatient = await prisma.patient.findUnique({
      where: { walletAddress: data.walletAddress },
    });

    if (existingPatient) {
      throw new Error('Wallet address pasien ini sudah terdaftar.');
    }

    return await prisma.patient.create({
      data: {
        walletAddress: data.walletAddress,
        name: data.name,
        patientId: data.patientId,
      },
    });
  }

  static async getAllPatients() {
    return await prisma.patient.findMany();
  }

  static async getPatientByWallet(walletAddress: string) {
    return await prisma.patient.findUnique({
      where: { walletAddress },
    });
  }
}