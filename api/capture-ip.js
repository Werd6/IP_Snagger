// Function to get real IP address (handles proxies and Vercel)
function getClientIP(req) {
    // Vercel provides IP in x-forwarded-for header
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim() ||
           'unknown';
}

module.exports = async function handler(req, res) {
    // Only allow GET requests
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const ip = getClientIP(req);
        const timestamp = new Date().toISOString();
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        const logEntry = {
            ip: ip,
            timestamp: timestamp,
            userAgent: userAgent,
            url: req.headers.referer || 'direct'
        };
        
        // Use a simple free storage service - kvdb.io (free tier, no auth)
        const STORE_KEY = 'ip-snagger-logs';
        const API_URL = `https://kvdb.io/${STORE_KEY}`;
        
        // Try to read existing logs
        let logs = [];
        try {
            const readResponse = await fetch(API_URL);
            if (readResponse.ok) {
                const text = await readResponse.text();
                if (text) {
                    logs = JSON.parse(text);
                    if (!Array.isArray(logs)) {
                        logs = [];
                    }
                }
            }
        } catch (err) {
            // Start with empty array if read fails
            logs = [];
        }
        
        // Add new log entry
        logs.push(logEntry);
        
        // Write back to kvdb
        try {
            await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(logs)
            });
        } catch (err) {
            console.error('Storage write failed:', err);
        }
        
        console.log(`IP captured: ${ip} at ${timestamp}`);
        
        res.json({ 
            success: true, 
            ip: ip,
            message: 'IP captured successfully'
        });
    } catch (error) {
        console.error('Error capturing IP:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to capture IP' 
        });
    }
}
