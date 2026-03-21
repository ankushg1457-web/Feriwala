const mongoose = require('mongoose');

async function connectMongoDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI not set in environment');

  await mongoose.connect(uri, {
    maxPoolSize: 10,
  });
}

module.exports = { connectMongoDB, mongoose };
