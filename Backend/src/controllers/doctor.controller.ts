import { Request, Response } from "express";
import { DoctorService } from "../services/doctor.service";

export class DoctorController {
  static async register(req: Request, res: Response) {
    try {
      // Data didapat dari body request Frontend
      const doctorData = req.body;

      //mengambil walletAddress dari header (x-wallet-address) dan menambahkannya ke doctorData
      const walletAddress = req.headers["x-wallet-address"];

      // Tambahkan walletAddress ke doctorData
      doctorData.walletAddress = walletAddress;

      const result = await DoctorService.registerDoctor(doctorData);

      res.status(201).json({
        success: true,
        message: "Registrasi dokter berhasil disimpan ke database.",
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
      const doctors = await DoctorService.getAllDoctors();
      res.status(200).json({ success: true, data: doctors });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  static async getProfile(req: Request, res: Response) {
    try {
      const { walletAddress: rawWallet } = req.params;
      // Normalize possible string | string[] | undefined to a single string
      const walletAddress = Array.isArray(rawWallet) ? rawWallet[0] : rawWallet;

      if (!walletAddress) {
        return res
          .status(400)
          .json({ success: false, message: "walletAddress is required" });
      }

      const doctor = await DoctorService.getDoctorByWallet(walletAddress);

      if (!doctor) {
        return res
          .status(404)
          .json({ success: false, message: "Dokter tidak ditemukan" });
      }

      res.status(200).json({ success: true, data: doctor });
    } catch (error: any) {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // Fungsi tambahan untuk admin memverifikasi dokter
  static async verify(req: Request, res: Response) {
    try {
      //cek walletAddress dari params, pastikan bisa handle string atau array

      const { walletAddress: rawWallet } = req.params;
      const walletAddress = Array.isArray(rawWallet) ? rawWallet[0] : rawWallet;

      if (!walletAddress) {
        return res
          .status(400)
          .json({ success: false, message: "walletAddress is required" });
      }

      const result = await DoctorService.verifyDoctor(walletAddress);

      res.status(200).json({
        success: true,
        message: "Dokter berhasil diverifikasi.",
        data: result,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}
