const mongoose = require('mongoose');

let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    return;
  }
  
  if (!process.env.MONGODB_URI) {
    console.error('DATABASE ERROR: MONGODB_URI is missing from environment variables!');
    throw new Error('Please define the MONGODB_URI environment variable');
  }

  try {
    console.log('Connecting to MongoDB...');
    const db = await mongoose.connect(process.env.MONGODB_URI);
    isConnected = db.connections[0].readyState;
    console.log('MongoDB connection status:', isConnected);
  } catch (error) {
    console.error('CRITICAL DATABASE ERROR:', error.message);
    throw error;
  }
}

const DataSchema = new mongoose.Schema({
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
}, { timestamps: true });

const Data = mongoose.models.Data || mongoose.model('Data', DataSchema);

module.exports = { connectToDatabase, Data };
