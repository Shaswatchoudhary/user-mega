const axios = require('axios');

const keys = [
  'LukoQrfVhOc7VpGmO3LeBdSVWfNPaKbR',
  'iS4bLUKZ5dd5nCSgZCnI3o7TKWSXOtIQ'
];

async function test() {
  for (const key of keys) {
    try {
      console.log(`Testing key: ${key}...`);
      const response = await axios.get('https://data.asincloud.com/v1/resource/product', {
        params: {
          api_key: key,
          domain: 'amazon.com',
          asin: 'B07C1S9D3S'
        }
      });
      console.log(`SUCCESS for ${key}:`, JSON.stringify(response.data, null, 2).substring(0, 500));
    } catch (e) {
      console.log(`FAILED for ${key}: ${e.message} - ${e.response?.status}`);
    }
  }
}

test();
