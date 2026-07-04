const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.NVIDIA_API_KEY || '',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

async function main() {
  try {
    const response = await openai.chat.completions.create({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: 'Hi' }],
      max_tokens: 10,
      stream: true,
    });
    for await (const chunk of response) {
      console.log(chunk.choices[0]?.delta?.content || '');
    }
    console.log('✅ Stream Success!');
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}
main();
