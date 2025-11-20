module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Try to read from jsonbin.io first
        const BIN_ID = process.env.JSONBIN_BIN_ID || '675a8f8ee41b4d34e44b1234';
        const API_KEY = process.env.JSONBIN_API_KEY || '';
        
        try {
            const readUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
            const response = await fetch(readUrl, {
                headers: API_KEY ? { 'X-Master-Key': API_KEY } : {}
            });
            
            if (response.ok) {
                const data = await response.json();
                let logs = data.record?.ips || data.record || [];
                if (Array.isArray(logs) && logs.length > 0) {
                    return res.json(logs);
                }
            }
        } catch (err) {
            console.error('JSONBin read error:', err);
        }
        
        // Fallback to /tmp
        try {
            const fs = require('fs').promises;
            const data = await fs.readFile('/tmp/captured_ips.json', 'utf8');
            const logs = JSON.parse(data);
            if (Array.isArray(logs) && logs.length > 0) {
                return res.json(logs);
            }
        } catch (err) {
            // Ignore
        }
        
        return res.json([]);
    } catch (error) {
        console.error('Error:', error);
        return res.json([]);
    }
}
