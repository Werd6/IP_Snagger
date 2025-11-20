// Combined endpoint: captures IP on GET and shows all IPs
// This ensures both operations happen in the same function instance

function getClientIP(req) {
    return req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
           req.headers['x-real-ip'] ||
           req.headers['x-vercel-forwarded-for']?.split(',')[0]?.trim() ||
           'unknown';
}

module.exports = async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const fs = require('fs').promises;
    const IP_LOG_FILE = '/tmp/captured_ips.json';
    
    try {
        // Read existing logs
        let logs = [];
        try {
            const data = await fs.readFile(IP_LOG_FILE, 'utf8');
            logs = JSON.parse(data);
            if (!Array.isArray(logs)) logs = [];
        } catch (err) {
            logs = [];
        }
        
        // Capture current visitor's IP
        const ip = getClientIP(req);
        const timestamp = new Date().toISOString();
        const userAgent = req.headers['user-agent'] || 'unknown';
        
        const logEntry = {
            ip: ip,
            timestamp: timestamp,
            userAgent: userAgent,
            url: req.headers.referer || 'direct'
        };
        
        // Check if this IP was already captured (avoid duplicates in same session)
        const isNew = !logs.some(entry => 
            entry.ip === ip && 
            entry.timestamp === timestamp
        );
        
        if (isNew) {
            logs.push(logEntry);
            if (logs.length > 1000) logs = logs.slice(-1000);
            await fs.writeFile(IP_LOG_FILE, JSON.stringify(logs, null, 2));
        }
        
        // Return all logs
        res.json(logs);
    } catch (error) {
        console.error('Error:', error);
        res.json([]);
    }
}

