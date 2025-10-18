import { Router } from 'express';
import multer from 'multer';
import { 
  createNoteController, 
  getAllNotesController, 
  getNoteByIdController,
  getNotesByPatientIdController,
  updateNoteController,
  deleteNoteController,
  processNoteController
} from './note.controllers';
import { asyncHandler } from '../../utils/async-handler';

const upload = multer({ dest: 'uploads/' });

const router = Router();

router.post('/', upload.single('file'), asyncHandler(createNoteController));

router.get('/', asyncHandler(getAllNotesController));

router.get('/patient/:patientId', asyncHandler(getNotesByPatientIdController));

router.post('/:id/process', asyncHandler(processNoteController));

router.get('/:id', asyncHandler(getNoteByIdController));

router.put('/:id', asyncHandler(updateNoteController));

router.delete('/:id', asyncHandler(deleteNoteController));

export default router;