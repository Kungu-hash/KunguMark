// Minimal static file server with a /api/contact POST endpoint
// Usage: node server.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const root = __dirname;
let transporter = null;
try {
  // lazy require so server can still run without nodemailer installed (but email won't work)
  const nodemailer = require('nodemailer');
  // SMTP config via env vars
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : undefined;
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  if (smtpHost && smtpPort && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({ host: smtpHost, port: smtpPort, secure: smtpPort === 465, auth: { user: smtpUser, pass: smtpPass } });
    // verify connection
    transporter.verify().then(() => console.log('SMTP transporter ready')).catch(err => { console.warn('SMTP verify failed:', err.message); transporter = null; });
  } else {
    console.log('SMTP not configured; email notifications disabled. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS to enable.');
  }
} catch (e) {
  console.log('Nodemailer not installed or failed to load. Email notifications disabled.');
}

function sendJSON(res, status, obj) {
  const payload = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function serveStatic(req, res) {
  let pathname = decodeURIComponent(req.url.split('?')[0]);
  if (pathname === '/') pathname = '/home.html';
  const filePath = path.join(root, pathname);
  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.end('Not found');
      return;
    }
    const stream = fs.createReadStream(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const map = {
      '.html': 'text/html',
      '.css': 'text/css',
      '.js': 'application/javascript',
      '.json': 'application/json',
      '.svg': 'image/svg+xml'
    };
    res.writeHead(200, {'Content-Type': map[ext] || 'application/octet-stream'});
    stream.pipe(res);
  });
}

function collectRequestData(req, callback) {
  let body = '';
  req.on('data', chunk => { body += chunk.toString(); });
  req.on('end', () => callback(null, body));
  req.on('error', err => callback(err));
}

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/api/contact') {
    collectRequestData(req, (err, body) => {
      if (err) return sendJSON(res, 500, {error: 'Error reading body'});
      let data;
      try {
        data = JSON.parse(body);
      } catch (e) {
        return sendJSON(res, 400, {error: 'Invalid JSON'});
      }
      if (!data.name || !data.email || !data.message) {
        return sendJSON(res, 400, {error: 'Missing fields'});
      }
      const file = path.join(root, 'contacts.json');
      fs.readFile(file, 'utf8', (readErr, content) => {
        let arr = [];
        if (!readErr) {
          try { arr = JSON.parse(content); } catch (e) { arr = []; }
        }
        const entry = { id: Date.now(), name: data.name, email: data.email, message: data.message, createdAt: new Date().toISOString() };
        arr.push(entry);
        fs.writeFile(file, JSON.stringify(arr, null, 2), err => {
          if (err) return sendJSON(res, 500, {error: 'Could not save contact'});
          // send email notification if transporter is configured
          if (transporter) {
            const mailOptions = {
              from: process.env.EMAIL_FROM || smtpUser || 'no-reply@example.com',
              to: process.env.NOTIFY_TO || 'kungumark321@gmail.com',
              subject: `New contact from ${entry.name}`,
              text: `Name: ${entry.name}\nEmail: ${entry.email}\nMessage:\n${entry.message}\n\nReceived: ${entry.createdAt}`
            };
            transporter.sendMail(mailOptions).then(info => {
              console.log('Notification email sent:', info.response || info.messageId);
            }).catch(emailErr => {
              console.error('Failed to send notification email:', emailErr && emailErr.message ? emailErr.message : emailErr);
            });
          }
          sendJSON(res, 200, {success: true, entry});
        });
      });
    });
    return;
  }

  // allow reading contacts.json for debugging (optional)
  if (req.method === 'GET' && req.url === '/api/contacts') {
    const file = path.join(root, 'contacts.json');
    fs.readFile(file, 'utf8', (err, content) => {
      if (err) return sendJSON(res, 200, []);
      try { sendJSON(res, 200, JSON.parse(content)); } catch (e) { sendJSON(res, 200, []); }
    });
    return;
  }

  // serve static files
  serveStatic(req, res);
});

server.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
