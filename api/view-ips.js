module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const fs = require('fs').promises;
        const IP_LOG_FILE = '/tmp/captured_ips.json';
        
        try {
            const data = await fs.readFile(IP_LOG_FILE, 'utf8');
            const logs = JSON.parse(data);
            return res.json(Array.isArray(logs) ? logs : []);
        } catch (err) {
            // File doesn't exist or can't be read
            return res.json([]);
        }
    } catch (error) {
        console.error('Error:', error);
        return res.json([]);
    }
}
