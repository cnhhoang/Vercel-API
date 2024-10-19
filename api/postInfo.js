import { MongoClient } from "mongodb";

// ====================================================================================================
const DATABASE = "webpage";
const COLLECTION = "info";

// --------------------------
async function connectToCollection(uri) {
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db(DATABASE);
    const collection = db.collection(COLLECTION);
    return collection;
}

//****************************************************************************************************
// API handler function
export default async function handler(req, res) {
    // CORS
    res.setHeader("Access-Control-Allow-Origin", "https://cnhhoang.github.io");
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
        console.log("Received visitor data:", visitorData);

        try {   // Try connecting to MongoDB
            const collection = await connectToCollection(process.env.MONGODB_URI);
            const result = await collection.insertOne(visitorData);
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
