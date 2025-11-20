// Function to get real IP address (handles proxies and Vercel)
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
        
        console.log('Capturing IP:', ip);
        
        // Use Supabase for persistent storage (free tier available)
        // For now, using a simple approach with a public JSON endpoint
        // You can replace this with Supabase, MongoDB, or another database
        
        // Simple storage using a public JSON file approach
        // Using jsonbin.io with a public bin (no auth needed for reading)
        const BIN_ID = process.env.JSONBIN_BIN_ID || '675a8f8ee41b4d34e44b1234';
        const API_KEY = process.env.JSONBIN_API_KEY || '';
        
        // Read existing logs
        let logs = [];
        try {
            const readUrl = `https://api.jsonbin.io/v3/b/${BIN_ID}/latest`;
            const readResponse = await fetch(readUrl, {
                headers: API_KEY ? { 'X-Master-Key': API_KEY } : {}
            });
            
            if (readResponse.ok) {
                const data = await readResponse.json();
                logs = data.record?.ips || data.record || [];
                if (!Array.isArray(logs)) logs = [];
            }
        } catch (err) {
            console.error('Read error:', err);
            logs = [];
        }
        
        // Add new entry
        logs.push(logEntry);
        if (logs.length > 1000) logs = logs.slice(-1000);
        
        // Write back (requires API key for writing)
        if (API_KEY) {
            try {
                await fetch(`https://api.jsonbin.io/v3/b/${BIN_ID}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Master-Key': API_KEY
                    },
                    body: JSON.stringify({ ips: logs })
                });
            } catch (err) {
                console.error('Write error:', err);
            }
        }
        
        // Also store in /tmp as backup
        try {
            const fs = require('fs').promises;
            await fs.writeFile('/tmp/captured_ips.json', JSON.stringify(logs, null, 2));
        } catch (err) {
            // Ignore
        }
        
        console.log(`IP captured: ${ip} | Total: ${logs.length}`);
        
        res.json({ 
            success: true, 
            ip: ip,
            total: logs.length
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to capture IP' });
    }
}
