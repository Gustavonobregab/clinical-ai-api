import { AppDataSource } from '../../config/database';
import { Note } from '../../entities/Note';
import { Patient } from '../../entities/Patient';
import { CreateNoteInput, UpdateNoteInput } from './note.types';
import { transcribeAudio, generateSummaryAndInsights } from '../ai/ai.core';
import { uploadToS3 } from '../../utils/upload';

const noteRepo = AppDataSource.getRepository(Note);
const patientRepo = AppDataSource.getRepository(Patient);

export const createNoteService = async (noteData: CreateNoteInput, file?: Express.Multer.File): Promise<Note> => {
  const patient = await patientRepo.findOne({ where: { id: noteData.patientId } });

  console.log("note data",noteData)

  if (!patient) throw new Error('Patient not found');

  let audioUrl = undefined;
  let rawText = noteData.rawText;

  
  if (noteData.inputType === 'AUDIO' && file) {
    audioUrl = await uploadToS3(file.path, file.originalname);
    console.log("audioUrl",audioUrl)
    rawText = await transcribeAudio(audioUrl);
  }

  const newNote = noteRepo.create({
    patient,
    inputType: noteData.inputType,
    rawText,
    audioUrl,
    status: 'CREATED',
  });

  return await noteRepo.save(newNote);
};


export const getAllNotesService = async (): Promise<Note[]> => {
  return await noteRepo.find({
    relations: ['patient'],
    order: { createdAt: 'DESC' }
  });
};

export const getNoteByIdService = async (id: number): Promise<Note | null> => {
  return await noteRepo.findOne({
    where: { id },
    relations: ['patient']
  });
};

export const getNotesByPatientIdService = async (patientId: number): Promise<Note[]> => {
  return await noteRepo.find({
    where: { patient: { id: patientId } },
    relations: ['patient'],
    order: { createdAt: 'DESC' }
  });
};

export const updateNoteService = async (id: number, updateData: UpdateNoteInput): Promise<Note | null> => {
  const note = await noteRepo.findOne({ where: { id } });
  if (!note) {
    return null;
  }

  Object.assign(note, updateData);
  return await noteRepo.save(note);
};

export const deleteNoteService = async (id: number): Promise<boolean> => {
  const note = await noteRepo.findOne({ where: { id } });
  if (!note) {
    return false;
  }
  
  await noteRepo.remove(note);
  return true;
};

export const processNoteService = async (noteId: number): Promise<Note> => {
  const note = await noteRepo.findOne({ 
    where: { id: noteId },
    relations: ['patient']
  });
  
  if (!note) {
    throw new Error('Note not found');
  }

  if (!note.rawText) {
    throw new Error('Note has no text content to process');
  }

  try {
    const aiReport = await generateSummaryAndInsights(note.rawText);

    note.summary = aiReport.summary;
    note.aiMeta = {
      insights: aiReport.insights,
      processedAt: new Date().toISOString()
    };
    note.status = 'PROCESSED';

    return await noteRepo.save(note);
  } catch (error) {
    note.status = 'FAILED';
    note.aiMeta = {
      error: error instanceof Error ? error.message : 'Unknown error',
      failedAt: new Date().toISOString()
    };
    await noteRepo.save(note);
    throw new Error('Failed to process note with AI');
  }
};
