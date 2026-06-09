import { Request, Response } from "express";
import { DocumentService } from "../services/document.service";
import { DoctorService } from "../services/doctor.service";
import { PatientService } from "../services/patient.service";

export interface AuthRequest extends Request {
  user?: { walletAddress: string };
}

export class DocumentController {
  static async createDraft(req: AuthRequest, res: Response): Promise<any> {
    try {
      // Ambil restDays dari body
      const { patientWallet, documentType, documentDescription, restDays } =
        req.body;

        console.log("body",req.body)
      const issuerWallet = req.headers["x-wallet-address"] as string;

      if (!issuerWallet || !patientWallet) {
        return res.status(400).json({ error: "Data dompet tidak lengkap." });
      }

      // Pastikan restDays dikonversi ke angka

      // Panggil Service untuk buat PDF.
      // (Kita tambahkan parsedRestDays agar tertulis di PDF jika diperlukan)
      const result = await DocumentService.createDraftPdf(
        patientWallet,
        issuerWallet,
        documentType,
        documentDescription,
        restDays,
      );

      return res.status(200).json({
        message: "Draft PDF berhasil dibuat.",
        documentHash: result.documentHash,
        filePath: result.filePath,
        documentType,
        documentDescription,
        patientWallet,
        restDays, // Kembalikan ke Frontend agar bisa dipakai saat Finalize
      });
    } catch (error) {
      return res.status(500).json({ error: "Gagal membuat draft dokumen." });
    }
  }

  static async finalizeDocument(req: AuthRequest, res: Response): Promise<any> {
    try {
      const issuerWallet = req.headers["x-wallet-address"] as string;
      if (!issuerWallet)
        return res.status(400).json({ error: "Sesi dokter tidak valid." });

      const newDocument = await DocumentService.saveDocument(
        req.body,
        issuerWallet,
      );

      return res.status(201).json({
        message: "Dokumen berhasil difinalisasi dan disimpan.",
        document: newDocument,
      });
    } catch (error) {
      return res.status(500).json({
        error:
          error instanceof Error ? error.message : "Gagal menyimpan dokumen.",
      });
    }
  }

  static async verifyByHash(req: Request, res: Response): Promise<any> {
    try {
      const documentHash = req.params.documentHash as string;
      const document = await DocumentService.verifyDocumentData(documentHash);
      console.log("✅ Verifikasi berhasil untuk hash:", documentHash);
      console.log("📄 Detail dokumen:", document);
      return res.status(200).json({
        status: "AUTHENTIC",
        message: "Dokumen asli dan terverifikasi.",
        document: {
          tokenId: document.tokenId,
          type: document.documentType,
          description: document.documentDescription,
          issuedAt: document.issuedAt,
          issuerWallet: document.issuerWallet,
          patientWallet: document.patientWallet,
        },
      });
    } catch (error: any) {
      console.error("🔥 ERROR VERIFIKASI:", error.message || error);
      if (error.message === "NOT_FOUND")
        return res.status(404).json({ error: "DOKUMEN TIDAK DITEMUKAN" });
      if (error.message === "REVOKED")
        return res.status(400).json({ error: "DOKUMEN TELAH DIBATALKAN" });
      if (error.message === "MANIPULATED")
        return res
          .status(400)
          .json({ error: "PERINGATAN: DOKUMEN DIMANIPULASI!" });
      return res.status(500).json({ error: "Gagal memverifikasi dokumen." });
    }
  }

  // POIN 7: Revoke (Pembatalan)
  static async revokeDocument(req: AuthRequest, res: Response): Promise<any> {
    try {
      const tokenId = req.params.tokenId as string;
      const issuerWallet = req.headers["x-wallet-address"] as string;

      if (!issuerWallet)
        return res.status(400).json({ error: "Autentikasi diperlukan." });

      await DocumentService.revokeDocument(tokenId, issuerWallet);

      return res.status(200).json({
        message: "Dokumen berhasil dibatalkan (Revoked) di sistem database.",
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  static async getDoctorHistory(req: AuthRequest, res: Response): Promise<any> {
    try {
      const doctorWallet = req.headers["x-wallet-address"] as string;
      const documents = await DoctorService.getDoctorHistory(doctorWallet);

      return res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      return res
        .status(500)
        .json({ error: "Gagal memuat riwayat dokumen dokter." });
    }
  }

  static async getPatientDocuments(
    req: AuthRequest,
    res: Response,
  ): Promise<any> {
    try {
      const patientWallet = req.headers["x-wallet-address"] as string;
      const documents = await PatientService.getPatientHistory(patientWallet);

      return res.status(200).json({
        success: true,
        data: documents,
      });
    } catch (error) {
      return res.status(500).json({ error: error });
    }
  }

  static async getDocumentByTokenId(req: Request, res: Response): Promise<any> {
    try {
      const tokenId = req.params.tokenId as string;
      const document = await DocumentService.getDocumentByTokenId(tokenId);

      if (!document) {
        return res.status(404).json({ error: "Dokumen tidak ditemukan." });
      }

      return res.status(200).json({
        success: true,
        data: document,
      });
    } catch (error) {
      return res.status(500).json({ error: "Gagal memuat dokumen." });
    }
  }
}
