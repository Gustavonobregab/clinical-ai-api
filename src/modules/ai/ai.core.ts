import OpenAI from 'openai';
import { env } from '../../config/env';
import * as fs from 'fs';

const openai = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : null;


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

  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioUrl),
    model: 'whisper-1',
  });
  return response.text;
}
