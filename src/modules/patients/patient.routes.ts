import { Router } from 'express';
import { createPatientController, getAllPatientsController, getPatientByIdController } from './patient.controllers';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();
//patients

router.post('/', asyncHandler(createPatientController));

router.get('/', asyncHandler(getAllPatientsController));

router.get('/:id', asyncHandler(getPatientByIdController));

export default router;
