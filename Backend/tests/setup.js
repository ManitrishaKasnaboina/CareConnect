const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

beforeAll(async () => {
  jest.setTimeout(120000);

  if (process.env.RUN_DB_TESTS !== 'true') {
    console.warn('Skipping Mongo-backed tests. Set RUN_DB_TESTS=true to enable integration tests.');
    return;
  }

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '7.0.14',
    },
  });

  const mongoUri = mongoServer.getUri();

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany();
    }
  }
});
