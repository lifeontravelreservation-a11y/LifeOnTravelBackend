const { connectToDatabase, Data } = require('./db');
const { isAuthenticated } = require('./auth');

module.exports = async (req, res) => {
  await connectToDatabase();

  if (req.method === 'GET') {
    // Add CORS headers to allow the main site to fetch the data
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    try {
      let dataDoc = await Data.findOne();
      if (!dataDoc || !dataDoc.content) {
        // Return empty object if no doc or no content
        return res.status(200).json({});
      }
      return res.status(200).json(dataDoc.content);
    } catch (error) {
      return res.status(500).json({ message: 'Error fetching data', error: error.message });
    }
  }

  if (req.method === 'POST') {
    if (!isAuthenticated(req)) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
      const newContent = req.body;
      let dataDoc = await Data.findOne();

      if (dataDoc) {
        dataDoc.content = newContent;
        dataDoc.markModified('content');
        await dataDoc.save();
      } else {
        dataDoc = await Data.create({ content: newContent });
      }

      return res.status(200).json({ success: true, message: 'Data saved successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Error saving data', error: error.message });
    }
  }

  res.status(405).json({ message: 'Method not allowed' });
};
