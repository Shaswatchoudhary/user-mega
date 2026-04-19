const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.js');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkWorkers() {
  const snapshot = await db.collection('workers').get();
  console.log(`Found ${snapshot.empty ? 0 : snapshot.docs.length} workers in Firestore.`);
  snapshot.docs.forEach(doc => {
    const data = doc.data();
    console.log('--- Worker ---');
    console.log('ID:', doc.id);
    console.log('Data:', JSON.stringify(data, null, 2));
  });
  process.exit(0);
}

checkWorkers().catch(console.error);
