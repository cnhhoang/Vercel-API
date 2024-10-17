// api/getIPInfo.js

const axios = require('axios');

export default async function handler(req, res) {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).end();
        return;
    }

    // Check if the request method is GET
    if (req.method !== 'GET') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(405).json({ message: 'Method not allowed' });
    }

    // Get the IP from query parameters
    const ip = req.query.ip;
    if (!ip) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(400).json({ message: 'IP parameter is required' });
    }

    const apiToken = 'f0b8fb50fc925f'; // Replace with your actual token
    const APIEndpoint = `https://ipinfo.io/${ip}?token=${apiToken}`;

    try {
        const response = await axios.get(APIEndpoint);
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(response.data);
    } catch (error) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(500).json({
            message: 'Internal server error',
            error: error.message || 'Unknown error',
        });
    }
}
