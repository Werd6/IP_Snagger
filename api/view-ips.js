module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const fs = require('fs').promises;
        const IP_LOG_FILE = '/tmp/captured_ips.json';
        
        try {
            const data = await fs.readFile(IP_LOG_FILE, 'utf8');
            const logs = JSON.parse(data);
            
            if (Array.isArray(logs)) {
                console.log(`Returning ${logs.length} IP entries`);
                return res.json(logs);
            } else {
                console.log('Logs file exists but is not an array');
                return res.json([]);
            }
        } catch (err) {
            if (err.code === 'ENOENT') {
                console.log('No IP log file found yet');
                return res.json([]);
            }
            console.error('Error reading IP log file:', err);
            return res.status(500).json({ 
                error: 'Failed to read IP logs',
                details: err.message 
            });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ 
            error: 'Failed to read IP logs',
            details: error.message 
        });
    }
}
