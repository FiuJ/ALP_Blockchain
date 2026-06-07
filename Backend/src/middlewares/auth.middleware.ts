import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Helper function untuk mengambil dan menormalkan wallet address dari header.
 * Wallet address selalu diubah ke huruf kecil (lowercase) agar pencocokan 
 * tidak gagal hanya karena perbedaan huruf besar/kecil (case-insensitive).
 */
const getWalletFromHeader = (req: Request): string | null => {
  const wallet = req.headers['x-wallet-address'];
  if (!wallet || typeof wallet !== 'string') return null;
  return wallet.toLowerCase();
};

// ==========================================
// 🟡 LEVEL 1: REQUIRE WALLET
// Hanya mengecek apakah request membawa identitas dompet.
// ==========================================
export const requireWallet = (req: Request, res: Response, next: NextFunction) => {
  const wallet = getWalletFromHeader(req);
  
  if (!wallet) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized. Identitas wallet (x-wallet-address) tidak ditemukan di header.' 
    });
  }

  next();
};

// ==========================================
// 🔴 LEVEL 2: REQUIRE ADMIN
// Mengecek apakah wallet yang merequest adalah alamat Deployer (Admin).
// ==========================================
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const wallet = getWalletFromHeader(req);
  const adminWallet = process.env.ADMIN_WALLET_ADDRESS?.toLowerCase();

  if (!wallet) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized. Identitas wallet tidak ditemukan di header.' 
    });
  }

  if (wallet !== adminWallet) {
    return res.status(403).json({ 
      success: false, 
      message: 'Forbidden. Hanya Administrator yang diizinkan mengakses rute ini.' 
    });
  }

  next();
};

// ==========================================
// 🔴 LEVEL 3: REQUIRE VERIFIED DOCTOR
// Mengecek apakah wallet adalah milik dokter yang statusnya isVerified = true.
// ==========================================
export const requireVerifiedDoctor = async (req: Request, res: Response, next: NextFunction) => {
  const wallet = getWalletFromHeader(req);

  if (!wallet) {
    return res.status(401).json({ 
      success: false, 
      message: 'Unauthorized. Identitas wallet tidak ditemukan di header.' 
    });
  }

  try {
    // Cari dokter di database berdasarkan wallet address
    const doctor = await prisma.doctor.findFirst({
      where: { 
        // Menggunakan pencarian case-insensitive (tergantung konfigurasi database)
        // Jika tidak disupport, pastikan saat registerWallet datanya disave dalam bentuk lowercase
        walletAddress: wallet 
      }
    });

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Not Found. Profil dokter tidak ditemukan di database.' 
      });
    }

    if (!doctor.isVerified) {
      return res.status(403).json({ 
        success: false, 
        message: 'Forbidden. Akun dokter Anda belum diverifikasi oleh Administrator.' 
      });
    }

    // Jika sukses terverifikasi, izinkan lanjut ke Controller (misal: fitur terbitkan surat)
    next();
    
  } catch (error) {
    console.error("Middleware Error (requireVerifiedDoctor):", error);
    return res.status(500).json({ 
      success: false, 
      message: 'Internal server error saat memverifikasi status dokter.' 
    });
  }
};