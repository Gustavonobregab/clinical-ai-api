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
You are an AI clinical documentation assistant.

Your task is to **analyze and summarize** the following clinical note provided by a healthcare professional.

### Instructions:
1. Summarize the note using the **SOAP** format:
   - **S (Subjective):** Patient-reported information, symptoms, and concerns.
   - **O (Objective):** Clinically observed or measured data (vitals, exam findings, tests).
   - **A (Assessment):** Clinician's interpretation, diagnoses, or impressions.
   - **P (Plan):** Next steps, treatments, medications, or follow-up recommendations.

2. Identify structured **insights** in JSON format, including:
   - **follow_ups:** list of recommended follow-up actions or check-ins.
   - **risk_flags:** potential clinical risks or urgent issues (e.g., "fall risk", "infection", "non-compliance").
   - **keywords:** relevant terms, symptoms, medications, or findings extracted from the note.

3. The output **must be valid JSON only**, no explanations, markdown, or prose.

### Example JSON output:
{
  "summary": {
    "subjective": "...",
    "objective": "...",
    "assessment": "...",
    "plan": "..."
  },
  "insights": {
    "follow_ups": [
      { "action": "Schedule blood test", "due_in_days": 7 }
    ],
    "risk_flags": [
      { "name": "High blood pressure", "severity": "moderate" }
    ],
    "keywords": ["hypertension", "fatigue", "diet"]
  }
}

### Clinical note:
"""${text}"""

### Output format:
Return a **single JSON object** exactly matching the structure above.
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
