import { MongoClient } from "mongodb";
import userAgentParser from "user-agent-parser";

// ====================================================================================================
const DATABASE = process.env.DATABASE;
const COLLECTION = "info";

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
        const parsedUA = userAgentParser(userAgent);
        const augmentedData = {
            ...visitorData,
            userAgent: userAgent,
            browser: parsedUA.browser.name,     // Browser name
            browserVersion: parsedUA.browser.version, // Browser version
            os: parsedUA.os.name,               // Operating system name
            osVersion: parsedUA.os.version,     // Operating system version
            deviceType: parsedUA.device.type,   // Device type (mobile, tablet, etc.)
            time: new Date().toISOString()      // Timestamp
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
