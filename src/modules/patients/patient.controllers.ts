import { Request, Response } from 'express';
import { CreatePatientSchema } from './patient.types';
import { createPatientService, getAllPatientsService, getPatientByIdService } from './patient.services';

export async function createPatientController(req: Request, res: Response) {
  const parseResult = CreatePatientSchema.safeParse(req.body);

  if (!parseResult.success) {
    res.status(400).json({
      success: false,
      message: "Invalid input",
      errors: parseResult.error.errors,
    });
    return;
  }

  const newPatient = await createPatientService(parseResult.data);
  res.status(201).json({
    success: true,
    data: newPatient,
    message: "Patient created successfully"
  });
}

export async function getAllPatientsController(req: Request, res: Response) {
  const patients = await getAllPatientsService();
  
  res.status(200).json({
    success: true,
    data: patients,
    total: patients.length,
    message: "Patients retrieved successfully"
  });
}

export async function getPatientByIdController(req: Request, res: Response) {
  const { id } = req.params;
  const patient = await getPatientByIdService(parseInt(id));
  
  if (!patient) {
    res.status(404).json({
      success: false,
      message: "Patient not found"
    });
    return;
  }

  res.status(200).json({
    success: true,
    data: patient,
    message: "Patient retrieved successfully"
  });
}