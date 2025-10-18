import { Router } from 'express';
import { 
  createNoteController, 
  getAllNotesController, 
  getNoteByIdController,
  getNotesByPatientIdController,
  updateNoteController,
  deleteNoteController 
} from './note.controllers';
import { asyncHandler } from '../../utils/async-handler';

const router = Router();

router.post('/', asyncHandler(createNoteController));

router.get('/', asyncHandler(getAllNotesController));

router.get('/patient/:patientId', asyncHandler(getNotesByPatientIdController));

router.get('/:id', asyncHandler(getNoteByIdController));

router.put('/:id', asyncHandler(updateNoteController));

router.delete('/:id', asyncHandler(deleteNoteController));

export default router;