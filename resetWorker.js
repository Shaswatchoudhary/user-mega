const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.js');

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function resetWorker() {
  const workerId = '69df630046dce3cc138d5474'; // Sakku's ID from the logs
  
  await db.collection('workers').doc(workerId).update({
    isAvailable: true,
    currentBookingId: null
  });
  
  console.log('✅ Sakku is now available again!');
  process.exit(0);
}

resetWorker().catch(console.error);
