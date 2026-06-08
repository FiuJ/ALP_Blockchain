import prisma from "../config/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import PDFDocument from "pdfkit";

export class DocumentService {
  // Poin 3: Create Draft
  static async createDraftPdf(patientWallet: string, issuerWallet: string, documentType: string, documentDescription: string): Promise<any> {
    const fileName = `DRAFT_${Date.now()}.pdf`;
    const dirPath = path.join(__dirname, "../../file_letters");
    if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
    const filePath = path.join(dirPath, fileName);

    return new Promise((resolve, reject) => {
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
  static async saveDocument(data: any, issuerWallet: string) {
    return await prisma.medicalDocument.create({
      data: {
        tokenId: data.tokenId.toString(),
        documentHash: data.documentHash,
        filePath: data.filePath,
        documentType: data.documentType,
        documentDescription: data.documentDescription,
        issuerWallet,
        patientWallet: data.patientWallet,
      }
    });
  }

  // Poin 5 & 6: Verify Hash
  static async verifyDocumentData(documentHash: string) {
    const document = await prisma.medicalDocument.findUnique({
      where: { documentHash },
      include: { issuer: true, patient: true }
    });

    if (!document) throw new Error("NOT_FOUND");
    if (document.isRevoked) throw new Error("REVOKED");

    const fullPath = path.join(__dirname, "../../file_letters", document.filePath);
    if (!fs.existsSync(fullPath)) throw new Error("FILE_MISSING");

    const fileBuffer = fs.readFileSync(fullPath);
    const hashSum = crypto.createHash("sha256");
    hashSum.update(fileBuffer);
    const currentPhysicalHash = hashSum.digest("hex");

    if (currentPhysicalHash !== document.documentHash) throw new Error("MANIPULATED");

    return document;
  }

  // Poin 7: Revoke Document
  static async revokeDocument(tokenId: string, issuerWallet: string) {
    // 1. Cek apakah dokumen ada
    const document = await prisma.medicalDocument.findUnique({
      where: { tokenId }
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
      data: { isRevoked: true }
    });
  }
}