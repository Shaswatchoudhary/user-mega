import { createClient } from '@insforge/sdk';

// Replace with actual backend credentials if available
const client = createClient({
  baseUrl: 'https://workeasemega.region.insforge.app',
  anonKey: 'your-anon-key-here' 
});

export default client;
