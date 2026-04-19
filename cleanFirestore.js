// Run this as Node.js script
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanData() {
  // Step 1: Delete all workers except SAKKU and PART
  const workersSnapshot = await db.collection('workers').get();
  const deletePromises = [];
  
  workersSnapshot.forEach(doc => {
    const data = doc.data();
    const name = (data.name || '').toLowerCase();
    if (!name.includes('sakku') && !name.includes('part')) {
      deletePromises.push(doc.ref.delete());
      console.log('Deleted worker:', data.name);
    }
  });
  await Promise.all(deletePromises);

  // Step 2: Update SAKKU and PART to be active and available
  const validWorkers = await db.collection('workers').get();
  for (const doc of validWorkers.docs) {
    await doc.ref.update({
      isActive: true,
      isAvailable: true,
      isVerified: true,
      rating: 4.8,
      currentLocation: {
        latitude: doc.data().location?.lat || 16.7050,
        longitude: doc.data().location?.lng || 74.2433,
        address: 'Kolhapur City, Maharashtra, India',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      }
    });
    console.log('Updated worker:', doc.data().name);
  }

  // Step 3: Delete all dummy users (no real phone or test numbers)
  const usersSnapshot = await db.collection('users').get();
  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    // Delete if no phone number or if test number
    if (!data.phoneNumber || data.phoneNumber.includes('test') 
        || data.isDummy === true) {
      await doc.ref.delete();
      console.log('Deleted dummy user:', doc.id);
    }
  }

  console.log('✅ Cleanup complete');
  process.exit(0);
}

cleanData().catch(console.error);
