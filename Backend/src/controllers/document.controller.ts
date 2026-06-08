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
      // const issuerWallet = req.user?.walletAddress;
      const issuerWallet = req.headers["x-wallet-address"] as string;
      if (!issuerWallet || !patientWallet) {
        return res.status(400).json({ error: "Data dompet tidak lengkap." });
      }

      // Buat nama file unik
      const fileName = `DRAFT_${Date.now()}.pdf`;
      // Pastikan folder exist
      const dirPath = path.join(__dirname, "../../file_letters");
      if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
      const filePath = path.join(dirPath, fileName);

      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });
      const writeStream = fs.createWriteStream(filePath);
      doc.pipe(writeStream);

      // ==========================================
      // DESAIN HEADER (Kop Surat Berwarna Biru)
      // ==========================================
      doc.rect(0, 0, doc.page.width, 110).fill("#2563eb"); // Warna latar biru (Tailwind blue-600)

      doc
        .fillColor("#ffffff")
        .fontSize(24)
        .font("Helvetica-Bold")
        .text("KLINIK WEB3 SEJAHTERA", 50, 40);

      doc
        .fontSize(10)
        .font("Helvetica")
        .text("Jl. Blockchain Nusantara No. 123, Surabaya, Jawa Timur", 50, 70);

      // Reset warna teks ke abu-abu gelap untuk isi dokumen
      doc.fillColor("#374151");

      // ==========================================
      // JUDUL SURAT
      // ==========================================
      doc.moveDown(5);
      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .text(documentType.toUpperCase(), {
          align: "center",
          characterSpacing: 2,
        });

      doc.moveDown(0.5);

      // Garis horizontal pemisah tipis
      doc
        .moveTo(50, doc.y)
        .lineTo(doc.page.width - 50, doc.y)
        .lineWidth(1)
        .stroke("#e5e7eb");

      // ==========================================
      // INFORMASI PIHAK TERKAIT
      // ==========================================
      doc.moveDown(2);
      const topY = doc.y;

      // Kolom Kiri: Dokter
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("DITERBITKAN OLEH:", 50, topY);
      doc
        .font("Courier")
        .fontSize(9)
        .text(issuerWallet, 50, topY + 15, { width: 200 });

      // Kolom Kanan: Pasien
      doc
        .fontSize(10)
        .font("Helvetica-Bold")
        .text("DIBERIKAN KEPADA:", 300, topY);
      doc
        .font("Courier")
        .fontSize(9)
        .text(patientWallet, 300, topY + 15, { width: 200 });

      // ==========================================
      // ISI KETERANGAN MEDIS
      // ==========================================
      doc.moveDown(4);
      doc
        .fillColor("#111827") // Hitam pekat untuk isi
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("HASIL PEMERIKSAAN & DIAGNOSIS:");

      doc.moveDown(0.5);

      doc.font("Helvetica").fontSize(11).text(documentDescription, {
        align: "justify",
        lineGap: 4, // Jarak antar baris agar nyaman dibaca
      });

      // ==========================================
      // FOOTER / AREA TANDA TANGAN
      // ==========================================
      const signatureY = doc.page.height - 180;

      doc
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Surabaya, ${new Date().toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}`,
          doc.page.width - 220,
          signatureY,
        );

      doc.text("Dokter Pemeriksa,", doc.page.width - 220, signatureY + 15);

      // Placeholder Tanda Tangan Digital
      doc
        .rect(doc.page.width - 220, signatureY + 35, 150, 40)
        .fillAndStroke("#f3f4f6", "#d1d5db");
      doc
        .fillColor("#9ca3af")
        .font("Helvetica-Oblique")
        .text("VALIDATED BY BLOCKCHAIN", doc.page.width - 215, signatureY + 50);

      doc
        .fillColor("#374151")
        .font("Helvetica-Bold")
        .text(
          "Dokter Terverifikasi Sistem",
          doc.page.width - 220,
          signatureY + 85,
        );

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
          patientWallet,
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
      const {
        tokenId,
        documentHash,
        filePath,
        documentType,
        documentDescription,
        patientWallet,
      } = req.body;
      const issuerWallet = req.headers["x-wallet-address"] as string;

      if (!issuerWallet) {
        return res
          .status(400)
          .json({ error: "Sesi dokter tidak valid atau tidak ditemukan." });
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
        },
      });

      return res.status(201).json({
        message: "Dokumen berhasil difinalisasi dan disimpan di database.",
        document: newDocument,
      });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ error: "Gagal menyimpan dokumen ke database." });
    }
  }

  // --------------------------------------------------------
  // Poin 5 & 6: Verifikasi Keaslian & Deteksi Manipulasi
  // Menggunakan Request standar karena ini endpoint publik (QR Scan)
  // --------------------------------------------------------
  static async verifyByHash(req: Request, res: Response): Promise<any> {
    try {
      const { documentHash } = req.params;

      if (!documentHash || Array.isArray(documentHash)) {
        return res.status(400).json({ error: "Hash dokumen tidak valid." });
      }

      const document = await prisma.medicalDocument.findUnique({
        where: { documentHash },
        include: { issuer: true, patient: true },
      });

      if (!document) {
        return res.status(404).json({ error: "DOKUMEN TIDAK DITEMUKAN" });
      }

      if (document.isRevoked) {
        return res
          .status(400)
          .json({ error: "DOKUMEN TELAH DIBATALKAN (REVOKED)" });
      }

      const fullPath = path.join(
        __dirname,
        "../../file_letters",
        document.filePath,
      );

      if (!fs.existsSync(fullPath)) {
        return res
          .status(404)
          .json({ error: "File fisik PDF tidak ditemukan di server." });
      }

      const fileBuffer = fs.readFileSync(fullPath);
      const hashSum = crypto.createHash("sha256");
      hashSum.update(fileBuffer);
      const currentPhysicalHash = hashSum.digest("hex");

      if (currentPhysicalHash !== document.documentHash) {
        return res.status(400).json({
          status: "MANIPULATED",
          error: "PERINGATAN MERAH: DOKUMEN TELAH DIMANIPULASI!",
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
          patientName: document.patient.name,
        },
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Gagal memverifikasi dokumen." });
    }
  }
}
