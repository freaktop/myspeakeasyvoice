// Quick test to verify OpenAI API key works
import 'dotenv/config';

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.error('❌ OPENAI_API_KEY environment variable is not set');
  process.exit(1);
}

console.log('Testing OpenAI API key...');

fetch('https://api.openai.com/v1/models', {
  headers: {
    'Authorization': `Bearer ${apiKey}`
  }
})
  .then(res => res.json())
  .then(data => {
    if (data.error) {
      console.error('❌ API Key Error:', data.error);
    } else {
      console.log('✅ API Key Valid! Available models:', data.data.length);
    }
  })
  .catch(err => console.error('❌ Request failed:', err));
