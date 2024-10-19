import { MongoClient } from "mongodb";

// ====================================================================================================
async function connectToDatabase(uri) {
    const client = await MongoClient.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
    const db = client.db('webpage');
    return db;
}

//****************************************************************************************************
// API handler function
export default async function handler(req, res) {
    // Handle CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");

    // Handle preflight request
    if (req.method === "OPTIONS") {
        res.status(200).end();
        return;
    }

    // Handle POST request to MongoDB
    if (req.method === "POST") {
        const visitorData = req.body;
        console.log("Received visitor data:", visitorData);

        try {   // Try connecting to MongoDB
            const db = await connectToDatabase(process.env.MONGODB_URI);
            const collection = db.collection('ip');
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
