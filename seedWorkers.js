// seedWorkers.js
const admin = require('firebase-admin');

// 💡 Replace with the path to your service account key JSON
// Get this from: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Kolhapur central point: 16.7050, 74.2433
const workers = [
  { name: "Rahul Patil", service: "Electrician", lat: 16.7020, lng: 74.2410, address: "Mahadwar Road" },
  { name: "Suresh Deshmukh", service: "Plumber", lat: 16.7120, lng: 74.2480, address: "Tarabai Park" },
  { name: "Amit Kulkarni", service: "Carpenter", lat: 16.6980, lng: 74.2350, address: "Rajarampuri" },
  { name: "Vikram Pawar", service: "Cleaner", lat: 16.7080, lng: 74.2520, address: "Shahupuri" },
  { name: "Ganesh Mane", service: "Electrician", lat: 16.7220, lng: 74.2650, address: "Kasaba Bawada" },
  { name: "Prasad Shinde", service: "Plumber", lat: 16.7040, lng: 74.2300, address: "Rankala Lake area" },
  { name: "Sachin More", service: "Carpenter", lat: 16.6920, lng: 74.2450, address: "Sane Guruji Vasahat" },
  { name: "Sunil Gaikwad", service: "Electrician", lat: 16.7150, lng: 74.2550, address: "Nagala Park" },
  { name: "Amol Jadhav", service: "Cleaner", lat: 16.7000, lng: 74.2480, address: "Dasara Chowk" },
  { name: "Nitin Kamble", service: "Plumber", lat: 16.7100, lng: 74.2380, address: "Shahu Market" }
];

async function seedData() {
  console.log('🚀 Seeding 10 workers in Kolhapur...');
  
  for (const w of workers) {
    const workerId = `worker_${Math.random().toString(36).substr(2, 9)}`;
    await db.collection('workers').doc(workerId).set({
      uid: workerId,
      name: w.name,
      phone: "+91" + Math.floor(1000000000 + Math.random() * 9000000000),
      profilePhoto: `https://avatar.iran.liara.run/public/${Math.floor(Math.random() * 100)}`,
      serviceType: w.service,
      location: {
        lat: w.lat,
        lng: w.lng,
        address: w.address
      },
      isActive: true,
      isAvailable: true,
      rating: parseFloat((Math.random() * (5.0 - 4.0) + 4.0).toFixed(1)),
      totalJobs: Math.floor(Math.random() * 100),
      fcmToken: "",
      currentBookingId: null,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
  
  console.log('✅ Seeding complete!');
  process.exit();
}

seedData().catch(console.error);
