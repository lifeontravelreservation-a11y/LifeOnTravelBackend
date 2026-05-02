require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
  console.log('Attempting to connect to MongoDB...');
  try {
    await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('Successfully connected to MongoDB!');
    
    const DataSchema = new mongoose.Schema({
      content: { type: mongoose.Schema.Types.Mixed, required: true },
    }, { collection: 'datas' }); // Default mongoose behavior is to pluralize
    
    const Data = mongoose.models.Data || mongoose.model('Data', DataSchema);
    
    console.log('Searching for data document...');
    const dataDoc = await Data.findOne();
    console.log('Full Document:', JSON.stringify(dataDoc, null, 2));
    if (dataDoc && dataDoc.content) console.log('Content keys:', Object.keys(dataDoc.content));
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

testConnection();
