import { MongoClient, ObjectId } from "mongodb";

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

    // POST request to update history
    if (req.method === "POST") {
        const { time, id, route } = req.body;
        if (!time || !id || !route) {
            return res.status(400).json({ success: false, message: "Missing parameters!" });
        }

        try {
            const collection = await connectToCollection();

            // Update document by pushing 'route' into the 'history' array
            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $push: { history: {route: route, time: time}} } 
            );

            if (result.matchedCount === 0) {
                return res.status(404).json({ success: false, message: "Document not found" });
            }

            res.status(200).json({ success: true, message: "Route added to history", result });
        } 
        catch (error) {
            console.error("Error updating MongoDB:", error);
            res.status(500).json({ success: false, message: "Failed to update MongoDB" });
        }
    } 
    else {
        res.status(405).json({ success: false, message: "Method not allowed" });
    }
};
