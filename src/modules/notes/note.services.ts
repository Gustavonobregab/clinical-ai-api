import { AppDataSource } from '../../config/database';
import { Note } from '../../entities/Note';
import { Patient } from '../../entities/Patient';
import { CreateNoteInput, UpdateNoteInput } from './note.types';
import { transcribeAudio } from '../ai/ai.core';
import { uploadToS3 } from '../../utils/upload';

const noteRepo = AppDataSource.getRepository(Note);
const patientRepo = AppDataSource.getRepository(Patient);

export const createNoteService = async (noteData: CreateNoteInput, file?: Express.Multer.File): Promise<Note> => {
  const patient = await patientRepo.findOne({ where: { id: noteData.patientId } });

  if (!patient) throw new Error('Patient not found');

  let audioUrl = undefined;
  let rawText = noteData.rawText;

  if (noteData.inputType === 'AUDIO' && file) {
    audioUrl = await uploadToS3(file.path, file.originalname);
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
