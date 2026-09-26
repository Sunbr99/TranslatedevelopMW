/**
 * MW Translate — Clean HTTPS Server
 * - รองรับทั้ง HTTP (redirect → HTTPS) และ HTTPS
 * - ไม่ log IP / User-Agent / request path
 * - Security headers ครบ
 */

const https = require('https');
const http  = require('http');
const fs    = require('fs');
const path  = require('path');

// ── Config ──
const HTTPS_PORT = 8443;
const HTTP_PORT  = 8080;   // redirect มาที่ HTTPS
const ROOT       = __dirname;

// ── SSL Certificate ──
let sslOptions = null;
const certPath = path.join(ROOT, 'cert.pem');
const keyPath  = path.join(ROOT, 'cert.key');

if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    sslOptions = {
        cert: fs.readFileSync(certPath),
        key:  fs.readFileSync(keyPath),
    };
}

// ── MIME Types ──
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js':   'application/javascript; charset=utf-8',
    '.css':  'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png':  'image/png',
    '.ico':  'image/x-icon',
    '.svg':  'image/svg+xml',
    '.webp': 'image/webp',
    '.txt':  'text/plain; charset=utf-8',
};

// ── Security Headers ──
const SEC_HEADERS = {
    'X-Content-Type-Options':  'nosniff',
    'X-Frame-Options':         'SAMEORIGIN',
    'Referrer-Policy':         'no-referrer',
    'Permissions-Policy':      'camera=(), microphone=(), geolocation=()',
    'Strict-Transport-Security': 'max-age=31536000',   // HTTPS only (HSTS)
};

// ── Request Counter (ไม่เก็บ detail) ──
let reqCount = 0;

// ── File Handler ──
function serveFile(req, res) {
    reqCount++;

    let urlPath = req.url.split('?')[0];

    // ป้องกัน path traversal
    if (urlPath.includes('..')) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    // default → index.html
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html';

    const filePath = path.join(ROOT, urlPath);

    // ต้องอยู่ใน ROOT เท่านั้น
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
        res.writeHead(403);
        res.end('403 Forbidden');
        return;
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            // PWA fallback → index.html
            fs.readFile(path.join(ROOT, 'index.html'), (err2, data2) => {
                if (err2) {
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('404 Not Found');
                    return;
                }
                const headers = {
                    'Content-Type': 'text/html; charset=utf-8',
                    'Cache-Control': 'no-cache, no-store',
                    ...SEC_HEADERS,
                };
                res.writeHead(200, headers);
                res.end(data2);
            });
            return;
        }

        const ext      = path.extname(filePath).toLowerCase();
        const mime     = MIME[ext] || 'application/octet-stream';
        const isStatic = ['.png', '.ico', '.svg', '.webp'].includes(ext);

        const headers = {
            'Content-Type':  mime,
            'Cache-Control': isStatic ? 'public, max-age=86400' : 'no-cache, no-store',
            ...SEC_HEADERS,
        };

        res.writeHead(200, headers);
        res.end(data);
    });
}

// ── HTTPS Server (หลัก) ──
if (sslOptions) {
    const httpsServer = https.createServer(sslOptions, serveFile);
    httpsServer.listen(HTTPS_PORT, '127.0.0.1', () => {
        printBanner();
    });

    // ── HTTP → HTTPS Redirect ──
    const httpServer = http.createServer((req, res) => {
        res.writeHead(301, {
            'Location': `https://127.0.0.1:${HTTPS_PORT}${req.url}`
        });
        res.end();
    });
    httpServer.listen(HTTP_PORT, '127.0.0.1');

} else {
    // ── HTTP fallback (ถ้าไม่มี cert) ──
    const httpServer = http.createServer(serveFile);
    httpServer.listen(HTTP_PORT, '127.0.0.1', () => {
        console.clear();
        console.log('╔══════════════════════════════════╗');
        console.log('║   ⚡ MW Translate Server (HTTP)   ║');
        console.log('╠══════════════════════════════════╣');
        console.log(`║  URL : http://127.0.0.1:${HTTP_PORT}    ║`);
        console.log('║  ⚠  cert.pem ไม่พบ → ใช้ HTTP  ║');
        console.log('║  Log : OFF (no tracking)         ║');
        console.log('║  Stop: Ctrl+C                    ║');
        console.log('╚══════════════════════════════════╝');
    });
}

function printBanner() {
    console.clear();
    console.log('╔══════════════════════════════════╗');
    console.log('║   ⚡ MW Translate Server (HTTPS)  ║');
    console.log('╠══════════════════════════════════╣');
    console.log(`║  HTTPS: https://127.0.0.1:${HTTPS_PORT}  ║`);
    console.log(`║  HTTP : http://127.0.0.1:${HTTP_PORT}    ║`);
    console.log('║         (redirect → HTTPS)        ║');
    console.log('║  Cert : self-signed (local only)  ║');
    console.log('║  Log  : OFF (no tracking)         ║');
    console.log('║  Stop : Ctrl+C                    ║');
    console.log('╚══════════════════════════════════╝');
    console.log('');
    console.log('  ⚠  เปิดครั้งแรก browser จะเตือน "Not secure"');
    console.log('     กด Advanced → Proceed to 127.0.0.1');
    console.log('     (เพราะใช้ self-signed cert เท่านั้น)');
}

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n  Server stopped. ข้อมูลไม่ถูกบันทึก');
    process.exit(0);
});
