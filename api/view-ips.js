const fs = require('fs').promises;

module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const IP_LOG_FILE = '/tmp/captured_ips.json';
        const data = await fs.readFile(IP_LOG_FILE, 'utf8');
        const logs = JSON.parse(data);
        res.json(logs);
    } catch (error) {
        // If file doesn't exist, return empty array
        if (error.code === 'ENOENT') {
            return res.json([]);
        }
        res.status(500).json({ error: 'Failed to read IP logs' });
    }
}

