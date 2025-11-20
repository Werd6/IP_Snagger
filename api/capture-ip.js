// Function to get real IP address (handles proxies and Vercel)
function getClientIP(req) {
    // Vercel provides IP in x-forwarded-for header
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim() ||
           req.socket?.remoteAddress ||
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
            url: req.headers.referer || req.url || 'direct'
        };
        
        console.log('Capturing IP:', ip);
        
        // Use a simple approach: store in /tmp (works within same function instance)
        // Also log to console for debugging
        const fs = require('fs').promises;
        const IP_LOG_FILE = '/tmp/captured_ips.json';
        
        let logs = [];
        try {
            const data = await fs.readFile(IP_LOG_FILE, 'utf8');
            logs = JSON.parse(data);
            if (!Array.isArray(logs)) {
                logs = [];
            }
        } catch (err) {
            // File doesn't exist, start fresh
            logs = [];
        }
        
        // Add new entry
        logs.push(logEntry);
        
        // Keep only last 1000 entries to prevent file from getting too large
        if (logs.length > 1000) {
            logs = logs.slice(-1000);
        }
        
        // Write to file
        await fs.writeFile(IP_LOG_FILE, JSON.stringify(logs, null, 2));
        
        console.log(`IP captured successfully: ${ip} at ${timestamp}`);
        console.log(`Total IPs stored: ${logs.length}`);
        
        res.json({ 
            success: true, 
            ip: ip,
            message: 'IP captured successfully',
            total: logs.length
        });
    } catch (error) {
        console.error('Error capturing IP:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Failed to capture IP',
            details: error.message
        });
    }
}
