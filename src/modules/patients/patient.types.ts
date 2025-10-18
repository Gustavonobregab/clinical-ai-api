import { z } from "zod";

export const CreatePatientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format").optional()
});

export type CreatePatientInput = z.infer<typeof CreatePatientSchema>;

export interface Patient {
  id: number;
  name: string;
  dob?: string | null;
  createdAt: Date;
  updatedAt: Date;
  notes?: any[]; 
}

export interface PatientResponse {
  success: boolean;
  data?: Patient;
  message?: string;
}

export interface PatientsListResponse {
  success: boolean;
  data?: Patient[];
  message?: string;
  total?: number;
}
