import { MongoClient, ObjectId } from "mongodb";

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

    // Handle POST request to update MongoDB 'history' array
    if (req.method === "POST") {
        const { id, route } = req.body;
        if (!id || !route) {
            return res.status(400).json({ success: false, message: "id and route are required" });
        }

        try {
            const db = await connectToDatabase(process.env.MONGODB_URI);
            const collection = db.collection('ip');

            // Update document by pushing 'route' into the 'history' array
            const result = await collection.updateOne(
                { _id: new ObjectId(id) }, // Filter by the document's id
                { $push: { history: route } } // Push new route to history array
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
