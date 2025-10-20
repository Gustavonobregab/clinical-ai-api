import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Patient } from '../entities/Patient';
import { Note } from '../entities/Note';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE ,
  entities: [Patient, Note],
  synchronize: true,
  logging: false,
});

const seedData = async () => {
  try {
    await dataSource.initialize();
    console.log('Database connected successfully');

    const existingNotes = await dataSource.getRepository(Note).find();
    const existingPatients = await dataSource.getRepository(Patient).find();
    
    if (existingNotes.length > 0) {
      await dataSource.getRepository(Note).remove(existingNotes);
    }
    if (existingPatients.length > 0) {
      await dataSource.getRepository(Patient).remove(existingPatients);
    }
    console.log('Cleared existing data');

    const patients = [
      {
        name: 'Emily Davis',
        dob: '1978-11-08'
      },
      {
        name: 'Gustavo Davis', 
        dob: '1978-11-08'
      },
      {
        name: 'Maria Silva',
        dob: '1985-03-15'
      }
    ];

    const createdPatients = [];
    for (const patientData of patients) {
      const patient = dataSource.getRepository(Patient).create(patientData);
      const savedPatient = await dataSource.getRepository(Patient).save(patient);
      createdPatients.push(savedPatient);
      console.log(`Created patient: ${savedPatient.name}`);
    }

    // Create notes for each patient
    const notesData = [
      {
        inputType: 'TEXT',
        rawText: `Patient presents with:
- Chief complaint: Chest pain and shortness of breath
- History of present illness: 45-year-old female with acute onset chest pain radiating to left arm, associated with diaphoresis and nausea
- Past medical history: Hypertension, diabetes mellitus type 2
- Medications: Metformin 500mg BID, Lisinopril 10mg daily
- Physical examination: Vital signs stable, no acute distress, heart rate regular, no murmurs
- Assessment: Possible acute coronary syndrome vs musculoskeletal chest pain
- Plan: EKG, cardiac enzymes, chest X-ray, cardiology consultation`,
        summary: '{"subjective":"Patient reports acute onset chest pain radiating to left arm, associated with diaphoresis and nausea.","objective":"Vital signs stable, no acute distress, heart rate regular, no murmurs observed during physical examination.","assessment":"Possible acute coronary syndrome vs musculoskeletal chest pain.","plan":"Perform EKG, cardiac enzymes, chest X-ray, and consult cardiology."}',
        aiMeta: {
          oasis: {
            mobility: "Independent",
            adl_status: "Independent", 
            pain_level: "Moderate",
            safety_concerns: "High",
            assistive_device: "None",
            cognitive_function: "Intact",
            medication_management: "Self-managed"
          },
          insights: {
            keywords: ["chest pain", "shortness of breath", "diaphoresis", "nausea", "hypertension", "diabetes mellitus type 2"],
            follow_ups: [{
              action: "Consult cardiology",
              deadline: "As soon as possible", 
              responsible_party: "Primary care physician"
            }],
            risk_flags: [{
              risk: "High risk for acute coronary syndrome",
              severity: "High"
            }],
            urgency_level: "urgent"
          },
          icd10_codes: [
            { code: "I20.9", description: "Angina pectoris, unspecified" },
            { code: "I10", description: "Essential (primary) hypertension" },
            { code: "E11.9", description: "Type 2 diabetes mellitus without complications" }
          ],
          discharge_report: {
            date: "Not specified",
            progress: "Stable with no acute distress noted.",
            admission_reason: "Chest pain and shortness of breath", 
            discharge_status: "Stable",
            treatment_summary: "Patient evaluated for acute coronary syndrome with EKG, cardiac enzymes, and chest X-ray planned.",
            follow_up_recommendations: "Follow up with cardiology for further evaluation."
          }
        },
        status: 'PROCESSED'
      },
      {
        inputType: 'TEXT',
        rawText: `Patient presents with:
- Chief complaint: Persistent cough and fatigue
- History of present illness: 47-year-old female with 2-week history of dry cough, mild fever, and general malaise
- Past medical history: Asthma, seasonal allergies
- Medications: Albuterol inhaler PRN, Fluticasone 220mcg daily
- Physical examination: Lungs clear bilaterally, no wheezing, temperature 99.1°F
- Assessment: Upper respiratory infection vs asthma exacerbation
- Plan: Chest X-ray, CBC, symptomatic treatment, follow-up in 1 week`,
        summary: '{"subjective":"Patient reports 2-week history of dry cough, mild fever, and general malaise.","objective":"Lungs clear bilaterally, no wheezing, temperature 99.1°F.","assessment":"Upper respiratory infection vs asthma exacerbation.","plan":"Chest X-ray, CBC, symptomatic treatment, follow-up in 1 week."}',
        aiMeta: {
          oasis: {
            mobility: "Independent",
            adl_status: "Independent",
            pain_level: "Mild", 
            safety_concerns: "Low",
            assistive_device: "None",
            cognitive_function: "Intact",
            medication_management: "Self-managed"
          },
          insights: {
            keywords: ["cough", "fatigue", "fever", "asthma", "allergies"],
            follow_ups: [{
              action: "Follow-up in 1 week",
              deadline: "1 week",
              responsible_party: "Primary care physician"
            }],
            risk_flags: [{
              risk: "Monitor for asthma exacerbation", 
              severity: "Low"
            }],
            urgency_level: "routine"
          },
          icd10_codes: [
            { code: "J06.9", description: "Acute upper respiratory infection, unspecified" },
            { code: "J45.9", description: "Asthma, unspecified" }
          ],
          discharge_report: {
            date: "Not specified",
            progress: "Stable with mild symptoms.",
            admission_reason: "Persistent cough and fatigue",
            discharge_status: "Stable", 
            treatment_summary: "Patient evaluated for upper respiratory symptoms with chest X-ray and CBC planned.",
            follow_up_recommendations: "Follow up in 1 week for symptom monitoring."
          }
        },
        status: 'PROCESSED'
      },
      {
        inputType: 'TEXT',
        rawText: `Patient presents with:
- Chief complaint: Severe headache and neck stiffness
- History of present illness: 46-year-old male with sudden onset severe headache, photophobia, and neck stiffness for 2 days
- Past medical history: Migraine, hypertension
- Medications: Propranolol 40mg daily, Sumatriptan 50mg PRN
- Physical examination: Neck stiffness positive, Kernig sign negative, temperature 100.2°F
- Assessment: Meningitis vs migraine with aura
- Plan: Lumbar puncture, blood cultures, CT head, neurology consultation`,
        summary: '{"subjective":"Patient reports sudden onset severe headache, photophobia, and neck stiffness for 2 days.","objective":"Neck stiffness positive, Kernig sign negative, temperature 100.2°F.","assessment":"Meningitis vs migraine with aura.","plan":"Lumbar puncture, blood cultures, CT head, neurology consultation."}',
        aiMeta: {
          oasis: {
            mobility: "Independent",
            adl_status: "Independent",
            pain_level: "Severe",
            safety_concerns: "High", 
            assistive_device: "None",
            cognitive_function: "Intact",
            medication_management: "Self-managed"
          },
          insights: {
            keywords: ["headache", "neck stiffness", "photophobia", "migraine", "hypertension"],
            follow_ups: [{
              action: "Neurology consultation",
              deadline: "Immediately",
              responsible_party: "Emergency department"
            }],
            risk_flags: [{
              risk: "High risk for meningitis",
              severity: "High"
            }],
            urgency_level: "urgent"
          },
          icd10_codes: [
            { code: "G03.9", description: "Meningitis, unspecified" },
            { code: "G43.9", description: "Migraine, unspecified" },
            { code: "I10", description: "Essential (primary) hypertension" }
          ],
          discharge_report: {
            date: "Not specified",
            progress: "Stable but requires immediate evaluation.",
            admission_reason: "Severe headache and neck stiffness",
            discharge_status: "Under evaluation",
            treatment_summary: "Patient evaluated for possible meningitis with lumbar puncture and imaging planned.",
            follow_up_recommendations: "Immediate neurology consultation required."
          }
        },
        status: 'PROCESSED'
      }
    ];

    for (let i = 0; i < createdPatients.length; i++) {
      const patient = createdPatients[i];
      
      for (const noteData of notesData) {
        const note = new Note();
        note.inputType = noteData.inputType as any;
        note.rawText = noteData.rawText;
        note.summary = noteData.summary;
        note.aiMeta = noteData.aiMeta;
        note.status = noteData.status as any;
        note.patient = patient;
        
        const savedNote = await dataSource.getRepository(Note).save(note);
        console.log(`Created note for ${patient.name}: ${savedNote.id}`);
      }
    }

    console.log('Seed completed successfully!');
    console.log(`Created ${createdPatients.length} patients with ${notesData.length} notes each`);
    
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
};

seedData();
