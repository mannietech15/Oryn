const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function main() {
  console.log('Testing NVIDIA API Key:', process.env.NVIDIA_API_KEY ? process.env.NVIDIA_API_KEY.slice(0, 10) + '...' : 'MISSING');
  try {
    const response = await openai.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10,
    });
    console.log('✅ Success!', response.choices[0]?.message?.content);
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}
main();
