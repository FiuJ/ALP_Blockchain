import { Router } from 'express';
import { DoctorController } from '../controllers/doctor.controller';
import { PatientController } from '../controllers/patient.controller';

const router = Router();

// Endpoint: POST /api/doctors/register
// Routes Dokter
router.post('/doctors/register', DoctorController.register);
router.get('/doctors', DoctorController.getAll);
router.get('/doctors/:walletAddress', DoctorController.getProfile);

// Routes Pasien
router.post('/patients/register', PatientController.register);
router.get('/patients', PatientController.getAll);
router.get('/patients/:walletAddress', PatientController.getProfile);

export default router;