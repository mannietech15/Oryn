const https = require('https');
https.get('https://integrate.api.nvidia.com/v1', (res) => {
  console.log('NVIDIA statusCode:', res.statusCode);
}).on('error', (e) => {
  console.error('NVIDIA error:', e);
});

https.get('https://openrouter.ai/api/v1', (res) => {
  console.log('OpenRouter statusCode:', res.statusCode);
}).on('error', (e) => {
  console.error('OpenRouter error:', e);
});
