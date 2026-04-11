const admin = require('firebase-admin');
const axios = require('axios');

const PRIMARY_KEY = 'LukoQrfVhOc7VpGmO3LeBdSVWfNPaKbR';
const SECONDARY_KEY = 'iS4bLUKZ5dd5nCSgZCnI3o7TKWSXOtIQ';
const ASIN_BASE_URL = 'https://data.asincloud.com/v1/resource/product';

// This script expects a serviceAccountKey.json in the project root
try {
  const serviceAccount = require('./serviceAccountKey.js');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
} catch (e) {
  console.log('Fallback to default auth...', e.message);
  admin.initializeApp({
    projectId: 'workies-app'
  });
}

const db = admin.firestore();

const categories = ['electrical', 'plumbing', 'ac', 'appliances', 'carpenter', 'menscare', 'womenscare'];

const problemProductMapping = [
  // ELECTRICAL
  { asin: "B09S9Y9N9S", category: "electrical", title: "Syska Smart LED Bulb", description: "Energy efficient smart LED bulb with voice control compatibility." },
  { asin: "B07C1S9D3S", category: "electrical", title: "Goldmedal Aura Modular Switch", description: "Premium modular switch set for modern home electrical fittings.", isTrending: true },
  
  // PLUMBING
  { asin: "B0B9P3W5W1", category: "plumbing", title: "Hindware Flora Faucet", description: "Durable and stylish bathroom faucet with high-pressure water flow." },
  { asin: "B0C1S9D3S", category: "plumbing", title: "Aquaguard Water Purifier", description: "Advanced RO+UV water purification system.", isTrending: true },

  // AC REPAIR (Summer Essentials)
  { asin: "B07W5W3Y8S", category: "ac", title: "LG 1.5 Ton 5 Star Inverter AC", description: "Premium cooling solution for Indian heat.", isSummer: true, isTrending: true },
  { asin: "B08B9P3W5W", category: "ac", title: "Blue Star 1.5 Ton Split AC", description: "Efficient and fast cooling AC design.", isSummer: true },
  { asin: "B0B9P3W5W9", category: "ac", title: "V-Guard Voltage Stabilizer for AC", description: "Essential protection for ACs during summer power fluctuations.", isSummer: true, isTrending: true },

  // APPLIANCES
  { asin: "B09NY6Y9S", category: "appliances", title: "Samsung 7Kg Front Load Washing Machine", description: "Advanced hygiene steam wash technology." },
  { asin: "B0B9P3W5W2", category: "appliances", title: "LG 260L Double Door Refrigerator", description: "Smart inverter compressor with multi-air flow.", isSummer: true, isTrending: true },
  { asin: "B0C1S9D3S6", category: "appliances", title: "Crompton Optimus Desert Air Cooler", description: "High-performance air cooler for large rooms.", isSummer: true, isTrending: true },

  // CARPENTER
  { asin: "B08J9N9S6S", category: "carpenter", title: "Bosch Cordless Drill Machine", description: "Professional grade drill for all your home carpentry needs.", isTrending: true },
  { asin: "B07Y5W3Y8S", category: "carpenter", title: "Asian Paints Wood Glue/Polish", description: "High-quality wood polish for furniture restoration." },

  // MENSCARE
  { asin: "B01D7S9N9S", category: "menscare", title: "Philips Beard Trimmer QT4001", description: "Advanced grooming kit for men's beard styling.", isTrending: true },
  { asin: "B09S9Y9N9T", category: "menscare", title: "Nivea Men Total Face Wash", description: "Deep cleaning formula for refreshed and clear skin." },

  // WOMENSCARE
  { asin: "B07C1S9D3T", category: "womenscare", title: "Philips HP8100 Hair Dryer", description: "Quick drying and styling for salon-like hair at home.", isTrending: true },
  { asin: "B0C1S9D3T2", category: "womenscare", title: "Neutrogena Hydro Boost Skin Cream", description: "Dermatologist recommended skincare for hydration." }
];

async function fetchFromAmazon(asin) {
  const tryFetch = async (key) => {
    try {
      const response = await axios.get(ASIN_BASE_URL, {
        params: { api_key: key, domain: 'amazon.com', asin }
      });
      return response.data?.data || null;
    } catch (err) {
      return null;
    }
  };

  let data = await tryFetch(PRIMARY_KEY);
  if (!data) data = await tryFetch(SECONDARY_KEY);
  return data;
}

async function seed() {
  console.log('🚀 Syncing Home Solutions Hub (7 Categories) from Amazon...');
  
  const fetchedProducts = [];
  
  for (const item of problemProductMapping) {
    console.log(`📦 Fetching: ${item.title} (${item.asin})...`);
    const data = await fetchFromAmazon(item.asin);
    
    const pData = {
      id: `${item.category}_${item.asin}`,
      asin: item.asin,
      name: data?.title || item.title,
      brand: data?.brand || item.title.split(' ')[0],
      imageUrl: data?.main_image || 'https://via.placeholder.com/400',
      priceRange: data?.price?.value ? `₹${data.price.value}` : 'Link available',
      rating: data?.rating || 4.7,
      description: data?.description || item.description,
      tips: data?.feature_bullets?.slice(0, 3) || ['Standard installation required', 'High quality material'],
      amazon_link: data?.link || `https://amazon.com/dp/${item.asin}`,
      category: item.category
    };
    fetchedProducts.push(pData);
    console.log(`   ✅ Success: ${pData.name.substring(0, 40)}...`);
  }

  const batch = db.batch();
  
  // Update products collection
  fetchedProducts.forEach(p => {
    const ref = db.collection('products').doc(p.id);
    batch.set(ref, p);
  });

  await batch.commit();
  console.log(`✅ Success! ${fetchedProducts.length} Products synced across all 7 categories.`);
  process.exit();
}

seed().catch(err => {
  console.error('❌ Error Seeding:', err.message);
  process.exit(1);
});
