const fs = require('fs').promises;

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
        
        // Use /tmp directory for file storage (works in Vercel serverless functions)
        // Note: Files in /tmp are ephemeral and reset on each deployment
        const IP_LOG_FILE = '/tmp/captured_ips.json';
        
        // Read existing logs
        let logs = [];
        try {
            const data = await fs.readFile(IP_LOG_FILE, 'utf8');
            logs = JSON.parse(data);
        } catch (err) {
            // File doesn't exist yet, start with empty array
            logs = [];
        }
        
        // Add new log entry
        logs.push(logEntry);
        
        // Write back to file
        await fs.writeFile(IP_LOG_FILE, JSON.stringify(logs, null, 2));
        
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

