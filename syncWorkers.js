const admin = require('firebase-admin');
const axios = require('axios');
const serviceAccount = require('./serviceAccountKey.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function syncWorkers() {
  try {
    console.log('Fetching workers from REST API...');
    // We fetch all categories to find SAKKU and PARTH
    const categories = ['Electrician', 'Plumber', 'Carpenter', 'Ac Repair', 'Appliance Repair', 'Menscare', 'Womenscare'];
    
    let allWorkers = [];
    console.log('Fetching workers from REST API by category...');
    
    for (const cat of categories) {
      try {
        const res = await axios.get(`https://workeasebackend.onrender.com/api/workers?category=${encodeURIComponent(cat)}&lat=16.705&lng=74.2433`);
        if (res.data && res.data.data) {
           allWorkers = [...allWorkers, ...res.data.data];
        }
      } catch(e) {
        console.log(`Failed to fetch category ${cat}:`, e.message);
      }
    }

    console.log(`Found ${allWorkers.length} total workers in MongoDB.`);

    // Filter SAKKU and PARTH
    const targetWorkers = allWorkers.filter(w => 
      w.fullName && (w.fullName.toUpperCase().includes('SAKKU') || w.fullName.toUpperCase().includes('PARTH') || w.fullName.toUpperCase().includes('SAK') || w.fullName.toUpperCase().includes('PAR'))
    );

    console.log(`Found ${targetWorkers.length} matching target workers (SAKKU/PARTH).`);

    if (targetWorkers.length === 0) {
      console.log('List of all worker names found:');
      allWorkers.forEach(w => console.log(`- ${w.fullName} (Category: ${w.category})`));
    }

    for (const worker of targetWorkers) {
      // Use Firebase Auth UID if exists, otherwise their MongoDB _id
      const docId = worker.firebaseUid || worker.uid || worker._id;
      
      const firestoreData = {
        fullName: worker.fullName,
        category: worker.category,
        serviceType: worker.category,
        isActive: true,
        isAvailable: true,
        isVerified: true, // Force verified so they show up
        rating: worker.rating || 4.0,
        experience: worker.experience || 4,
        basePrice: worker.basePrice || 399,
        lat: worker.location?.coordinates?.[1] || 16.7050,
        lng: worker.location?.coordinates?.[0] || 74.2433,
        phone: worker.phone || '',
        syncedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('workers').doc(docId).set(firestoreData, { merge: true });
      console.log(`✅ Synced ${worker.fullName} to Firestore with ID: ${docId}`);
    }

    console.log('Migration complete!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exit(1);
  }
}

syncWorkers();
