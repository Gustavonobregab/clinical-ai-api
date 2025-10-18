import OpenAI from 'openai';
const openai = new OpenAI();
import * as fs from 'fs';


export async function generateSummaryAndInsights(text: string) {
  const prompt = `
  Summarize the following clinical note in SOAP format and extract follow-up actions:
  """${text}"""
  Respond as JSON: { "summary": "...", "insights": {...} }
  `;
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
  });

  const content = response.choices[0].message?.content ?? '{}';
  return JSON.parse(content);
}



export async function transcribeAudio(audioUrl: string): Promise<string> {
  const response = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioUrl),
    model: 'whisper-1',
  });
  return response.text;
}
