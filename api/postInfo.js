import { MongoClient } from "mongodb";

// ====================================================================================================
const DATABASE = process.env.DATABASE;
const COLLECTION = process.env.COLLECTION_INFO;

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
// API handler function
export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", process.env.ACCESS_CONTROL_ALLOW_ORIGIN);
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // preflight request
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    // POST request to create session
    if (req.method === "POST") {
        const visitorData = req.body;
        const userAgent = req.headers['user-agent'];
        const referrer = req.headers.referer === "https://cnhhoang.github.io/" ? '' : req.headers.referer || '';
        let ipInfo;
        try {
            const ipInfoResponse = await fetch(`https://ipinfo.io/${req.body.ip}?token=${process.env.IPINFO_TOKEN}`);
            ipInfo = await ipInfoResponse.json();
        } catch (error) {
            console.error("Error fetching IP info:", error);
            res.status(500).json({ success: false, message: "Failed to fetch IP info", error });
        }

        const augmentedData = {
            ...visitorData,
            userAgent: userAgent,
            referrer: referrer,
            ipInfo: ipInfo,
            time: new Date().toISOString()
        };        

        try {   // Try connecting to MongoDB
            const collection = await connectToCollection();
            const result = await collection.insertOne(augmentedData);
            res.status(200).json({ success: true, message: "Data added to MongoDB", result });
        } 
        catch (error) {
            console.error("Error pushing data to MongoDB:", error); 
            res.status(500).json({ success: false, message: "Failed to push data to MongoDB" + error});
        }
    } 
    else {
        res.status(405).json({ success: false, message: "Method not allowed" });
    }
};
