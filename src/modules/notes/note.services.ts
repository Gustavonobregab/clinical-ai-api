import { AppDataSource } from '../../config/database';
import { Note } from '../../entities/Note';
import { Patient } from '../../entities/Patient';
import { CreateNoteInput, UpdateNoteInput } from './note.types';

export const createNoteService = async (noteData: CreateNoteInput): Promise<Note> => {
  const noteRepository = AppDataSource.getRepository(Note);
  const patientRepository = AppDataSource.getRepository(Patient);
  
  const patient = await patientRepository.findOne({ where: { id: noteData.patientId } });
  
  if (!patient) {
    throw new Error('Patient not found');
  }

  const newNote = noteRepository.create({
    patient: patient,
    inputType: noteData.inputType,
    rawText: noteData.rawText,
    summary: noteData.summary,
    audioUrl: noteData.audioUrl,
    aiMeta: noteData.aiMeta,
    status: 'CREATED'
  });

  return await noteRepository.save(newNote);
};

export const getAllNotesService = async (): Promise<Note[]> => {
  const noteRepository = AppDataSource.getRepository(Note);
  return await noteRepository.find({
    relations: ['patient'],
    order: { createdAt: 'DESC' }
  });
};

export const getNoteByIdService = async (id: number): Promise<Note | null> => {
  const noteRepository = AppDataSource.getRepository(Note);
  return await noteRepository.findOne({
    where: { id },
    relations: ['patient']
  });
};

export const getNotesByPatientIdService = async (patientId: number): Promise<Note[]> => {
  const noteRepository = AppDataSource.getRepository(Note);
  return await noteRepository.find({
    where: { patient: { id: patientId } },
    relations: ['patient'],
    order: { createdAt: 'DESC' }
  });
};

export const updateNoteService = async (id: number, updateData: UpdateNoteInput): Promise<Note | null> => {
  const noteRepository = AppDataSource.getRepository(Note);
  
  const note = await noteRepository.findOne({ where: { id } });
  if (!note) {
    return null;
  }

  Object.assign(note, updateData);
  return await noteRepository.save(note);
};

export const deleteNoteService = async (id: number): Promise<boolean> => {
  const noteRepository = AppDataSource.getRepository(Note);
  
  const note = await noteRepository.findOne({ where: { id } });
  if (!note) {
    return false;
  }
  
  await noteRepository.remove(note);
  return true;
};
