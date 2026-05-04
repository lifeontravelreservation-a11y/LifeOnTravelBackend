const { connectToDatabase, Data } = require('./db');
const { isAuthenticated } = require('./auth');

module.exports = async (req, res) => {
  await connectToDatabase();

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    // Add CORS headers to allow the main site to fetch the data
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      let dataDoc = await Data.findOne();
      if (!dataDoc || !dataDoc.content) {
        console.log('API DATA: No data document found in DB.');
        return res.status(200).json({});
      }
      console.log('API DATA: Successfully fetched content.');
      return res.status(200).json(dataDoc.content);
    } catch (error) {
      console.error('API DATA ERROR (GET):', error.message);
      return res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) {
      console.log('API DATA: Unauthorized POST attempt.');
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const newContent = req.body;
      let dataDoc = await Data.findOne();

      if (dataDoc) {
        dataDoc.content = newContent;
        dataDoc.markModified('content');
        await dataDoc.save();
        console.log('API DATA: Updated existing document.');
      } else {
        dataDoc = await Data.create({ content: newContent });
        console.log('API DATA: Created new document.');
      }

      return res.status(200).json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
      console.error('API DATA ERROR (POST):', error.message);
      return res.status(500).json({ message: 'Error saving data', error: error.message });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
};
