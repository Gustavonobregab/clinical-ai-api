import { Request, Response } from 'express';
import { CreateNoteSchema, UpdateNoteSchema } from './note.types';
import { 
  createNoteService, 
  getAllNotesService, 
  getNoteByIdService, 
  getNotesByPatientIdService,
  updateNoteService,
  deleteNoteService 
} from './note.services';

export async function createNoteController(req: Request, res: Response) {
  const parseResult = CreateNoteSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: parseResult.error.errors,
    });
    return;
  }

  try {
    const newNote = await createNoteService(parseResult.data);
    res.status(201).json({
      success: true,
      data: newNote
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : "Failed to create note"
    });
  }
}

export async function getAllNotesController(req: Request, res: Response) {
  try {
    const notes = await getAllNotesService();
    
    res.status(200).json({
      success: true,
      data: notes,
      total: notes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve notes"
    });
  }
}

export async function getNoteByIdController(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    const note = await getNoteByIdService(parseInt(id));
    
    if (!note) {
      res.status(404).json({
        success: false,
        message: "Note not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: note
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve note"
    });
  }
}

export async function getNotesByPatientIdController(req: Request, res: Response) {
  const { patientId } = req.params;
  
  try {
    const notes = await getNotesByPatientIdService(parseInt(patientId));
    
    res.status(200).json({
      success: true,
      data: notes,
      total: notes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to retrieve patient notes"
    });
  }
}

export async function updateNoteController(req: Request, res: Response) {
  const { id } = req.params;
  const parseResult = UpdateNoteSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: parseResult.error.errors,
    });
    return;
  }

  try {
    const updatedNote = await updateNoteService(parseInt(id), parseResult.data);
    
    if (!updatedNote) {
      res.status(404).json({
        success: false,
        message: "Note not found"
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: updatedNote
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update note"
    });
  }
}

export async function deleteNoteController(req: Request, res: Response) {
  const { id } = req.params;
  
  try {
    const deleted = await deleteNoteService(parseInt(id));
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: "Note not found"
      });
      return;
    }

    res.status(200).json({
      success: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete note"
    });
  }
}
