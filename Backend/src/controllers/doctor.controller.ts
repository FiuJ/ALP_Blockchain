import { Request, Response, NextFunction } from 'express';
import { RegisterDoctorDto } from '../interfaces/doctor.interface';
import { registerDoctorService } from '../services/doctorService';

export const registerDoctorController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const doctorData: RegisterDoctorDto = req.body;

    // 1. Validasi Input Dasar
    if (!doctorData.walletAddress || !doctorData.name || !doctorData.doctorLicenseNumber) {
       return res.status(400).json({
        success: false,
        message: 'Data tidak lengkap. Pastikan wallet, nama, dan nomor SIP terisi.',
      });
    }

    // 2. Panggil Service Layer
    const result = await registerDoctorService(doctorData);

    // 3. Kembalikan Response Sukses
    res.status(201).json({
      success: true,
      message: 'Profil dokter berhasil disimpan di database lokal.',
      data: result,
    });

  } catch (error: any) {
    // Tangani error dari Service (misal: duplikat SIP / Wallet)
    if (error.message.includes('sudah terdaftar')) {
      return res.status(409).json({ 
        success: false, 
        message: error.message 
      });
    }
    
    // Jika error lain (misal koneksi database putus), lempar ke Global Error Handler
    next(error);
  }
};