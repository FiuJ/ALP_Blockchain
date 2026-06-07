import { Request, Response } from 'express';
import { PatientService } from '../services/patient.service';

export class PatientController {
  static async register(req: Request, res: Response) {
    try {
      const patientData = req.body;
      const result = await PatientService.registerPatient(patientData);
      
      res.status(201).json({
        success: true,
        message: 'Registrasi pasien berhasil disimpan ke database.',
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const patients = await PatientService.getAllPatients();
      res.status(200).json({ success: true, data: patients });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const { walletAddress } = req.params;
      
      if (!walletAddress) {
        return res.status(400).json({ success: false, message: 'Wallet address is required' });
      }
      
      const patient = await PatientService.getPatientByWallet(walletAddress as string);
      
      if (!patient) {
        return res.status(404).json({ success: false, message: 'Pasien tidak ditemukan' });
      }

      res.status(200).json({ success: true, data: patient });
    } catch (error: any) {
      res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}