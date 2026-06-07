import { Router } from "express";
import {
  requireWallet,
  requireAdmin,
  requireVerifiedDoctor,
} from "../middlewares/auth.middleware";
import { DoctorController } from "../controllers/doctor.controller";
import { PatientController } from "../controllers/patient.controller";

const router = Router();

// ==========================================
// 🟢 PUBLIC ROUTES (Tanpa Middleware)
// ==========================================
router.get("/doctors", DoctorController.getAll);
router.get("/patients", PatientController.getAll);
router.get("/doctors/:walletAddress", DoctorController.getProfile);
// router.get('/documents/verify/:documentHash', DocumentController.verifyByHash);

// ==========================================
// 🟡 BASIC PROTECTED ROUTES (requireWallet)
// ==========================================
router.post("/doctors/register", requireWallet, DoctorController.register);
router.post("/patients/register", requireWallet, PatientController.register);
router.get(
  "/patients/:walletAddress",
  requireWallet,
  PatientController.getProfile,
);
// router.get('/documents/patient/:walletAddress', requireWallet, DocumentController.getPatientHistory);

// ==========================================
// 🔴 ADMIN ROUTES (requireAdmin)
// ==========================================
router.patch(
  "/admin/doctors/:walletAddress/verify",
  requireAdmin,
  DoctorController.verify,
);

// ==========================================
// 🟣 DOCTOR ONLY ROUTES (requireVerifiedDoctor)
// ==========================================
// router.post('/documents/draft', requireVerifiedDoctor, DocumentController.createDraft);
// router.post('/documents/finalize', requireVerifiedDoctor, DocumentController.finalizeDocument);
// router.patch('/documents/:tokenId/revoke', requireVerifiedDoctor, DocumentController.revokeDocument);
// router.get('/documents/doctor/:walletAddress', requireVerifiedDoctor, DocumentController.getDoctorHistory);

export default router;
