import OpenAI from 'openai';
import dotenv from 'dotenv';
dotenv.config();

async function test() {
  const key = process.env.OPENROUTER_API_KEY;
  console.log('Testing OpenRouter Key:', key ? `${key.slice(0, 10)}...` : 'MISSING');

  const openai = new OpenAI({
    apiKey: key || '',
    baseURL: 'https://openrouter.ai/api/v1',
  });

  try {
    const response = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.1-8b-instruct:free',
      messages: [{ role: 'user', content: 'Hi' }],
    });
    console.log('✅ Success! Response:', response.choices[0]?.message?.content);
  } catch (err: any) {
    console.error('❌ Failed!');
    console.error('Error:', err.message);
    if (err.status) console.error('Status:', err.status);
  }
}

test();
