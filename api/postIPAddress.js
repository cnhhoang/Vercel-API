import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Function to connect to MongoDB
async function connectToMongo() {
  if (!client.isConnected()) {
    await client.connect();
  }
  return client.db("webpage").collection("ip");
}

// API handler
export default async function handler(req, res) {
  // Handle CORS
  res.setHeader("Access-Control-Allow-Origin", "*"); // Allow all origins (for development purposes)
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    res.status(200).end(); // Respond with 200 OK for preflight requests
    return;
  }

  if (req.method === "POST") {
    const visitorData = req.body;

    try {
      const collection = await connectToMongo();
      const result = await collection.insertOne(visitorData);
      res.status(200).json({ success: true, message: "Data added to MongoDB", result });
    } catch (error) {
      console.error("Error pushing data to MongoDB:", error);
      res.status(500).json({ success: false, message: "Failed to push data to MongoDB" });
    }
  } else {
    res.status(405).json({ success: false, message: "Method not allowed" });
  }
}
