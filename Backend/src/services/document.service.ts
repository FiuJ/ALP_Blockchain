import prisma from "../config/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export class DocumentService {
  // Poin 3: Create Draft
  static async createDraftPdf(
    patientWallet: string,
    issuerWallet: string,
    documentType: string,
    documentDescription: string,
    restDays: number,
  ): Promise<any> {
    console.log("📋 Membuat draft PDF dengan data:", restDays)
    const fileName = `DRAFT_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, "../../file_letters");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);

    return new Promise((resolve, reject) => {
    

      // 1. Inisialisasi PDF dengan Margin dan Ukuran Kertas A4
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
      doc.fontSize(16).font("Helvetica-Bold").text(documentType.toUpperCase(), {
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
      doc.font("Helvetica").fontSize(11).text(documentDescription, {
        align: "justify",
        lineGap: 4,
      });

      // Menambahkan keterangan hari istirahat
      if (restDays > 0) {
        doc.moveDown();
        doc
          .font("Helvetica-Bold")
          .text(`Pasien diberikan waktu istirahat selama ${restDays} hari.`);
      }
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

      writeStream.on("finish", () => {
        try {
          const fileBuffer = fs.readFileSync(filePath);
          const hashSum = crypto.createHash("sha256");
          hashSum.update(fileBuffer);
          const documentHash = hashSum.digest("hex");

          resolve({ documentHash, filePath: fileName });
        } catch (error) {
          reject(error);
        }
      });
      writeStream.on("error", reject);
    });
  }

  // Poin 4: Finalize Document
  // Di dalam DocumentService.ts

  // Poin 4: Finalize Document
  static async saveDocument(data: any, issuerWallet: string) {
    console.log("📥 Menerima data untuk finalisasi dokumen:", data);
    // Logika Kalkulasi expiredAt
    let expiredAtDate = null;
    if (data.restDays && parseInt(data.restDays) > 0) {
      // Ambil tanggal hari ini
      const currentDate = new Date();
      // Tambahkan jumlah hari istirahat
      currentDate.setDate(currentDate.getDate() + parseInt(data.restDays));
      expiredAtDate = currentDate;
    }

    return await prisma.medicalDocument.create({
      data: {
        tokenId: data.tokenId.toString(),
        documentHash: data.documentHash,
        filePath: data.filePath,
        documentType: data.documentType,
        documentDescription: data.documentDescription,
        issuerWallet,
        patientWallet: data.patientWallet,
        // 👇 Simpan expiredAt yang sudah dikalkulasi
        expiredAt: expiredAtDate,
      },
    });
  }
  // Poin 5 & 6: Verify Hash
  static async verifyDocumentData(documentHash: string) {
    const document = await prisma.medicalDocument.findUnique({
      where: { documentHash },
      // include: { issuer: true, patient: true },
    });
    console.log("🔍 Mencari dokumen dengan hash:", document);

    if (!document) throw new Error("NOT_FOUND");
    if (document.isRevoked) throw new Error("REVOKED");

    const fullPath = path.join(
      process.cwd(),
      "file_letters",
      document.filePath,
    );
    if (!fs.existsSync(fullPath)) throw new Error("FILE_MISSING");

    const fileBuffer = fs.readFileSync(fullPath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    const currentPhysicalHash = hashSum.digest("hex");

    if (currentPhysicalHash !== document.documentHash)
      throw new Error("MANIPULATED");

    return document;
  }

  // Poin 7: Revoke Document
  static async revokeDocument(tokenId: string, issuerWallet: string) {
    // 1. Cek apakah dokumen ada
    const document = await prisma.medicalDocument.findUnique({
      where: { tokenId },
    });

    if (!document) {
      throw new Error("Dokumen tidak ditemukan di database.");
    }

    // 2. Cek apakah yang membatalkan adalah dokter yang sama yang membuat
    if (document.issuerWallet !== issuerWallet) {
      throw new Error("Akses ditolak. Anda bukan penerbit dokumen ini.");
    }

    // 3. Update status menjadi revoked
    return await prisma.medicalDocument.update({
      where: { tokenId },
      data: { isRevoked: true },
    });
  }

  static async getPatientDocuments(patientWallet: string) {
    return await prisma.medicalDocument.findMany({
      where: { patientWallet },
      include: { issuer: true },
    });
  }
  static async getDocumentByTokenId(tokenId: string) {
    return await prisma.medicalDocument.findUnique({
      where: { tokenId },
      include: { issuer: true, patient: true },
    });
  }
}
