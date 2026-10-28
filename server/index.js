require('events').EventEmitter.defaultMaxListeners = 50;
/**
 * AITAG Platform — Express Server & Entry Point
 * Port: 5000 / 5005 (Light Theme Architecture)
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const devEnvPath = path.join(__dirname, '../.env.development');
if (fs.existsSync(devEnvPath) && (process.env.NODE_ENV === 'development' || process.env.USE_DEV_DB === 'true' || process.env.PORT === '8000')) {
  require('dotenv').config({ path: devEnvPath, override: true });
}

const express = require('express');
const http = require('http');
const cors = require('cors');
const WebSocket = require('ws');
const kernel = require('./kernel');

const PORT = process.env.PORT || 8000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.get('/healthz', (req, res) => res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString(), env: process.env.NODE_ENV || 'production' }));

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5005', 'http://localhost:8000', 'https://aitag.pages.dev', 'https://aitag.onrender.com', 'https://aitag-dev.onrender.com', 'https://shortshub.app'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  req.wss = wss;
  next();
});

// Bootstrap Fractal Kernel
kernel.init(app);

// -------------------------------------------------------------
// Global Static Pipeline for Modern AITAG React Frontend (SPA)
// -------------------------------------------------------------
const clientDistPath = path.join(__dirname, '../client/dist');
const serverPublicPath = path.join(__dirname, 'public');

const staticPath = fs.existsSync(path.join(clientDistPath, 'index.html'))
  ? clientDistPath
  : serverPublicPath;

// Serve static assets from both dist and public to prevent breaking active tabs
app.use(express.static(staticPath));
if (staticPath !== serverPublicPath && fs.existsSync(serverPublicPath)) {
  app.use(express.static(serverPublicPath));
}
// Explicitly serve /uploads
app.use('/uploads', express.static(path.join(serverPublicPath, 'uploads')));

// Missing /assets requests must return 404 with plain text, NEVER HTML!
app.use('/assets', (req, res) => {
  res.status(404).type('text/plain').send('Asset not found');
});

// Universal SPA Catch-all for /dashboard, /profile, /signin, /tasks, /browse, /all_tasks, etc.
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
    return next();
  }
  const indexHtml = path.join(staticPath, 'index.html');
  if (fs.existsSync(indexHtml)) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    return res.sendFile(indexHtml);
  }
  res.status(404).send('Frontend build not found.');
});

// WebSocket Handler
wss.on('connection', (ws) => {
  console.log('⚡ AITAG Client connected via WebSocket');

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message);
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(data));
        }
      });
    } catch (e) {
      console.error('WS Error:', e.message);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`=======================================================`);
  console.log(`🌟 AITAG SaaS AI Marketplace Platform Live!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Theme: Modern Light UI Design`);
  console.log(`Static Path: ${staticPath}`);
  console.log(`=======================================================`);
});
