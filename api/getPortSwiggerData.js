import { MongoClient } from 'mongodb';

// ====================================================================================================
let cachedDb = null;
const COLLECTION = "portswigger-labs";
// --------------------------
async function connectToCollection() {
    if (cachedDb)
        return cachedDb;
    
    const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db(process.env.DATABASE);
    cachedDb = db;
    const collection = db.collection(COLLECTION);
    return collection;
}

//****************************************************************************************************
module.exports = async (req, res) => {
    // Handle CORS
    res.setHeader('Access-Control-Allow-Origin', process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS')
        return res.status(200).end();

    try {
        const collection = await connectToCollection();
        const data = await collection.find({}).toArray();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: {error} });
    }
};
