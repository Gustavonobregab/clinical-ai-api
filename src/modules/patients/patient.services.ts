import { AppDataSource } from '../../config/database';
import { Patient } from '../../entities/Patient';
import { CreatePatientInput } from './patient.types';

export const createPatientService = async (patientData: CreatePatientInput): Promise<Patient> => {
  const patientRepository = AppDataSource.getRepository(Patient);
  
  const existingPatient = await patientRepository.findOne({ where: { name: patientData.name } });
  if (existingPatient) {
    throw new Error('Patient with this name already exists');
  }

  const newPatient = patientRepository.create({
    name: patientData.name,
    dob: patientData.dateOfBirth,
  });

  return await patientRepository.save(newPatient);
};

export const getAllPatientsService = async (): Promise<Patient[]> => {
  const patientRepository = AppDataSource.getRepository(Patient);
  return await patientRepository.find();
};

export const getPatientByIdService = async (id: number): Promise<Patient | null> => {
  const patientRepository = AppDataSource.getRepository(Patient);
  return await patientRepository.findOne({ where: { id } });
};
