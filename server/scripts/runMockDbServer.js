import { MongoMemoryServer } from 'mongodb-memory-server';

const startMockDb = async () => {
  try {
    console.log('Starting in-memory MongoDB server on port 27017...');
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbPath: './data/db',
        storageEngine: 'wiredTiger'
      }
    });
    console.log(`🚀 Mock MongoDB is running at: ${mongoServer.getUri()}`);
    console.log('Keep this terminal open to keep the database active.');
  } catch (error) {
    console.error('Failed to start mock MongoDB server:', error);
    process.exit(1);
  }
};

startMockDb();
