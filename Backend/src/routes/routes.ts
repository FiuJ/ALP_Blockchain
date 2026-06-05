import { Router } from 'express';
import { registerDoctorController } from '../controllers/doctor.controller';

const router = Router();

// Endpoint: POST /api/doctors/register
router.post('/doctor/register', registerDoctorController);

export default router;