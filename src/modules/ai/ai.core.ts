import OpenAI from 'openai';
import * as fs from 'fs';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;


export async function generateSummaryAndInsights(text: string) {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
  }

  const prompt = `
You are an AI clinical documentation assistant specialized in structuring and coding healthcare provider notes.

Your task is to analyze the following clinical note and return **five clearly separated structured outputs**:
SOAP summary, clinical insights, ICD-10 diagnostic codes, OASIS assessment fields, and a discharge summary.

---

### 1️⃣ SOAP FORMAT SUMMARY
- **Subjective (S):** Patient-reported symptoms, complaints, and history.
- **Objective (O):** Clinically observed findings, vitals, and test results.
- **Assessment (A):** Diagnoses or impressions.
- **Plan (P):** Treatments, procedures, and follow-up recommendations.

---

### 2️⃣ CLINICAL INSIGHTS
Provide key insights extracted from the note:
- **Follow-ups:** Specific next actions with deadlines and responsible parties.
- **Risk flags:** Potential medical or safety risks with severity.
- **Keywords:** Relevant symptoms, conditions, body systems, and medications.
- **Urgency level:** routine / urgent / emergent.

---

### 3️⃣ ICD-10 CODES
Suggest ICD-10 diagnostic codes with official code and description.
Example:
[
  { "code": "I10", "description": "Essential (primary) hypertension" },
  { "code": "E11.9", "description": "Type 2 diabetes mellitus without complications" }
]

---

### 4️⃣ OASIS (Outcome and Assessment Information Set)
Extract structured fields relevant to home-health documentation.
Include only if information is available.
Example:
{
  "mobility": "Independent",
  "pain_level": "Moderate",
  "cognitive_function": "Intact",
  "assistive_device": "Cane",
  "medication_management": "Self-managed"
}

---

### 5️⃣ DISCHARGE REPORT
If applicable, summarize patient status at discharge:
{
  "date": "YYYY-MM-DD",
  "admission_reason": "Reason for care",
  "treatment_summary": "Summary of care provided",
  "progress": "Clinical progress",
  "follow_up_recommendations": "Next steps after discharge"
}

---

### 6️⃣ FINAL OUTPUT FORMAT
Return a single valid JSON object with this exact structure:

{
  "summary": {
    "subjective": "",
    "objective": "",
    "assessment": "",
    "plan": ""
  },
  "insights": {
    "follow_ups": [],
    "risk_flags": [],
    "keywords": [],
    "urgency_level": ""
  },
  "icd10_codes": [],
  "oasis": {},
  "discharge_report": {}
}

---

### 7️⃣ RULES
- Return **only valid JSON** (no markdown or explanations).
- Use precise clinical terminology.
- Include realistic and clinically relevant details.
- If a section is not applicable, return an empty object or array.
- Maintain compliance with standard medical documentation practices.

---

### CLINICAL NOTE TO ANALYZE:
"""${text}"""

Now return the JSON object only.
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message?.content ?? "{}";
  return JSON.parse(content);
}


export async function transcribeAudio(audioUrl: string): Promise<string> {
  if (!openai) {
    throw new Error('OpenAI API key is not configured. Please set the OPENAI_API_KEY environment variable.');
  }

  const urlMatch = audioUrl.match(/https:\/\/([^.]+)\.s3\.([^.]+)\.amazonaws\.com\/(.+)/);
  if (!urlMatch) {
    throw new Error('Invalid S3 URL format');
  }
  
  const [, bucket, region, key] = urlMatch;
  
  const s3Client = new S3Client({
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
    region: region
  });

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const response = await s3Client.send(command);
  
  if (!response.Body) {
    throw new Error('Failed to download audio file from S3');
  }

  const chunks: Uint8Array[] = [];
  const stream = response.Body as Readable;
  
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  
  const audioBuffer = Buffer.concat(chunks);
  const audioBlob = new Blob([audioBuffer]);
  const audioFile = new File([audioBlob], 'audio.ogg', { type: 'audio/ogg' });

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
  });
  
  return transcription.text;
}
