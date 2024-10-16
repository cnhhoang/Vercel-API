import { MongoClient } from 'mongodb';

// ====================================================================================================
let cachedDb = null;

async function connectToDatabase(uri) {
    if (cachedDb)
        return cachedDb;
    
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db('webpage');
    cachedDb = db;
    return db;
}

//****************************************************************************************************
module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', 'https://cnhhoang.github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS')
        return res.status(200).end();

    try {
        const db = await connectToDatabase(process.env.MONGODB_URI);
        const collection = db.collection('portswigger-labs');
        const data = await collection.find({}).toArray();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch data' });
    }
};
