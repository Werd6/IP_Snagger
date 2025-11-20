module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Read from kvdb.io
        const STORE_KEY = 'ip-snagger-logs';
        const API_URL = `https://kvdb.io/${STORE_KEY}`;
        
        try {
            const response = await fetch(API_URL);
            if (response.ok) {
                const text = await response.text();
                if (text) {
                    const logs = JSON.parse(text);
                    if (Array.isArray(logs)) {
                        return res.json(logs);
                    }
                }
            }
        } catch (err) {
            console.error('Storage read failed:', err);
        }
        
        // Fallback to empty array
        res.json([]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read IP logs' });
    }
}
