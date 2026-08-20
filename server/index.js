const fs = require('fs');
/**
 * AITAG Platform — Express Server & Entry Point
 * Port: 5000 (Light Theme Architecture)
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

const express = require('express');
const http = require('http');
const path = require('path');
const cors = require('cors');
const WebSocket = require('ws');
const kernel = require('./kernel');

const PORT = process.env.PORT || 5000;
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://localhost:5005', 'https://aitag.pages.dev'],
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
// Global Static Pipeline for Modern AITAG React Frontend (client/dist)
// -------------------------------------------------------------
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/ws')) {
      return next();
    }
    res.sendFile(path.join(clientDist, 'index.html'));
  });
} else {
  // Fallback to public folder if dist not built yet
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

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

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🌟 AITAG SaaS AI Marketplace Platform Live!`);
  console.log(`URL: http://localhost:${PORT}`);
  console.log(`Theme: Modern Light UI Design`);
  console.log(`Architecture: Sandwich AST + Fractal Kernel + AI Sandbox`);
  console.log(`=======================================================`);
});
