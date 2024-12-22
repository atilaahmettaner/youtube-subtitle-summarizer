import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'YOUR_API_KEY'
});

export async function getAiSummary(lang, text) {
  try {
    let prompt;
    if (lang === 'tr') {
      prompt = `Bu metnin özetini yapar mısın?\n\n"${text}"`;
    } else if (lang === 'en') {
      prompt = `Summarize the following text:\n\n"${text}"`;
    } else if (lang === 'es') {
      prompt = `Hazme un resumen del siguiente texto:\n\n"${text}"`;
    } else {
      prompt = `Please summarize the following text:\n\n"${text}"`;
    }

    const completion = await openai.completions.create({
      model: 'text-davinci-003',
      prompt,
      max_tokens: 800,
      temperature: 0.7
    });

    return completion.choices[0].text.trim();
  } catch (error) {
    console.error('OpenAI error:', error);
    return 'Özetleme yapılamadı.';
  }
} 