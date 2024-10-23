import { MongoClient } from 'mongodb';

// ====================================================================================================
const DATABASE = process.env.DATABASE;
const COLLECTION = process.env.COLLECTION_PORTSWIGGER;

// --------------------------
let cachedDb = null;
let cachedClient = null;

// --------------------------
async function connectToCollection() {
    if (cachedClient && cachedDb)
        return cachedDb.collection(COLLECTION);

    if (!cachedClient) {
        cachedClient = await MongoClient.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
    cachedDb = cachedClient.db(DATABASE);
    return cachedDb.collection(COLLECTION);
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
