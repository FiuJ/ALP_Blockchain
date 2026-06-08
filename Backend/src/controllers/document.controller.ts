import { Request, Response } from "express";
import prisma from "../config/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

// ==========================================
// 🛠️ CUSTOM INTERFACE
// Memberitahu TypeScript bahwa Request ini memiliki data 'user'
// ==========================================
export interface AuthRequest extends Request {
  user?: {
    walletAddress: string;
  };
}

export class DocumentController {
  
  // --------------------------------------------------------
  // Poin 3: Penerbitan Surat (Draft & Generate Hash)
  // Menggunakan AuthRequest karena butuh data dokter yang login
  // --------------------------------------------------------
  static async createDraft(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { patientWallet, documentType, documentDescription } = req.body;
      const issuerWallet = req.user?.walletAddress;

      if (!issuerWallet || !patientWallet) {
        return res.status(400).json({ error: "Data dompet tidak lengkap." });
      }

      // Buat nama file unik
      const fileName = `DRAFT_${Date.now()}.pdf`;
      // Pastikan folder exist
      const dirPath = path.join(__dirname, "../../file_letters");
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      const filePath = path.join(dirPath, fileName);

      // Membuat wujud fisik PDF
      const doc = new PDFDocument();
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);
      
      doc.fontSize(20).text("Medical Document", { align: "center" });
      doc.moveDown();
      doc.fontSize(12).text(`Issuer Wallet: ${issuerWallet}`);
      doc.text(`Patient Wallet: ${patientWallet}`);
      doc.text(`Type: ${documentType}`);
      doc.moveDown();
      doc.text(`Description: ${documentDescription}`);
      doc.end();

      // Tunggu sampai file selesai ditulis untuk di-hash
      writeStream.on("finish", () => {
        const fileBuffer = fs.readFileSync(filePath);
        const hashSum = crypto.createHash("sha256");
        hashSum.update(fileBuffer);
        const documentHash = hashSum.digest("hex");

        return res.status(200).json({
          message: "Draft PDF berhasil dibuat.",
          documentHash,
          filePath: fileName, 
          documentType,
          documentDescription,
          patientWallet
        });
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal membuat draft dokumen." });
    }
  }

  // --------------------------------------------------------
  // Poin 4: Penyimpanan ke Database setelah NFT dicetak
  // Menggunakan AuthRequest karena butuh data dokter yang login
  // --------------------------------------------------------
  static async finalizeDocument(req: AuthRequest, res: Response): Promise<any> {
    try {
      const { tokenId, documentHash, filePath, documentType, documentDescription, patientWallet } = req.body;
      const issuerWallet = req.user?.walletAddress;

      if (!issuerWallet) {
          return res.status(400).json({ error: "Sesi dokter tidak valid atau tidak ditemukan." });
      }

      const newDocument = await prisma.medicalDocument.create({
        data: {
          tokenId: tokenId.toString(), 
          documentHash,
          filePath,
          documentType,
          documentDescription,
          issuerWallet,
          patientWallet,
        }
      });

      return res.status(201).json({
        message: "Dokumen berhasil difinalisasi dan disimpan di database.",
        document: newDocument
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal menyimpan dokumen ke database." });
    }
  }

  // --------------------------------------------------------
  // Poin 5 & 6: Verifikasi Keaslian & Deteksi Manipulasi
  // Menggunakan Request standar karena ini endpoint publik (QR Scan)
  // --------------------------------------------------------
  static async verifyByHash(req: Request, res: Response): Promise<any> {
    try {
      const { documentHash } = req.params;

      const document = await prisma.medicalDocument.findUnique({
        where: { documentHash },
        include: { issuer: true, patient: true } 
      });

      if (!document) {
        return res.status(404).json({ error: "DOKUMEN TIDAK DITEMUKAN" });
      }

      if (document.isRevoked) {
         return res.status(400).json({ error: "DOKUMEN TELAH DIBATALKAN (REVOKED)" });
      }

      const fullPath = path.join(__dirname, "../../file_letters", document.filePath);
      
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ error: "File fisik PDF tidak ditemukan di server." });
      }

      const fileBuffer = fs.readFileSync(fullPath);
      const hashSum = crypto.createHash("sha256");
      hashSum.update(fileBuffer);
      const currentPhysicalHash = hashSum.digest("hex");

      if (currentPhysicalHash !== document.documentHash) {
        return res.status(400).json({ 
          status: "MANIPULATED",
          error: "PERINGATAN MERAH: DOKUMEN TELAH DIMANIPULASI!" 
        });
      }

      return res.status(200).json({
        status: "AUTHENTIC",
        message: "Dokumen asli dan terverifikasi.",
        document: {
          tokenId: document.tokenId,
          type: document.documentType,
          description: document.documentDescription,
          issuedAt: document.issuedAt,
          issuerName: document.issuer.name,
          patientName: document.patient.name
        }
      });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal memverifikasi dokumen." });
    }
  }
}