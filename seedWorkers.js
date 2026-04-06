// seedWorkers.js
const admin = require('firebase-admin');

// 💡 Replace with the path to your service account key JSON
// Get this from: Firebase Console > Project Settings > Service Accounts
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Real Kolhapur coordinates provided by User:
// 1. Mahadwar Road: 16.7015, 74.2311 (Electrician)
// 2. Tarabai Park: 16.7139, 74.2473 (Plumber)
// 3. Rajarampuri: 16.7067, 74.2234 (Electrician)
// 4. Shahupuri: 16.7089, 74.2356 (AC Repair)
// 5. Kasaba Bawada: 16.6934, 74.2198 (Carpenter)
// 6. Rankala Lake: 16.7023, 74.2189 (Electrician)
// 7. Shivaji University: 16.6854, 74.2367 (Plumber)
// 8. Ujlaiwadi: 16.7201, 74.2289 (AC Repair)
// 9. Gandhinagar: 16.7156, 74.2534 (Carpenter)
// 10. Laxmipuri: 16.7034, 74.2423 (Cleaner)

const workers = [
  { name: "Rahul Patil", service: "electrician", lat: 16.7015, lng: 74.2311, address: "Mahadwar Road" },
  { name: "Suresh Deshmukh", service: "plumber", lat: 16.7139, lng: 74.2473, address: "Tarabai Park" },
  { name: "Amit Kulkarni", service: "electrician", lat: 16.7067, lng: 74.2234, address: "Rajarampuri" },
  { name: "Vikram Pawar", service: "ac_repair", lat: 16.7089, lng: 74.2356, address: "Shahupuri" },
  { name: "Ganesh Mane", service: "carpenter", lat: 16.6934, lng: 74.2198, address: "Kasaba Bawada" },
  { name: "Prasad Shinde", service: "electrician", lat: 16.7023, lng: 74.2189, address: "Rankala Lake" },
  { name: "Sachin More", service: "plumber", lat: 16.6854, lng: 74.2367, address: "Shivaji University" },
  { name: "Sunil Gaikwad", service: "ac_repair", lat: 16.7201, lng: 74.2289, address: "Ujlaiwadi" },
  { name: "Amol Jadhav", service: "carpenter", lat: 16.7156, lng: 74.2534, address: "Gandhinagar" },
  { name: "Nitin Kamble", service: "cleaner", lat: 16.7034, lng: 74.2423, address: "Laxmipuri" }
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
