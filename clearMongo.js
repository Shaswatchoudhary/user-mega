const { MongoClient } = require('mongodb');

const uri = "";

async function clearMongo() {
  const client = new MongoClient(uri);

  try {
    console.log('Connecting to MongoDB...');
    await client.connect();
    console.log('Connected successfully!');
    
    const db = client.db('workerBooking');
    const workersCollection = db.collection('workers');
    
    console.log('Deleting all workers from MongoDB...');
    const result = await workersCollection.deleteMany({});
    console.log(`✅ Successfully deleted ${result.deletedCount} workers from MongoDB.`);
  } catch (error) {
    console.error('Error clearing MongoDB:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB.');
  }
}

clearMongo();
