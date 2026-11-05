/**
 * AITAG Contact & Customer Support Routes
 * Base Path: /api/contact
 */

const express = require('express');
const router = express.Router();
const service = require('./service');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Health / Status Probe
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'aitag-contact',
    timestamp: new Date().toISOString()
  });
});

// POST /api/contact — Submit a customer inquiry
router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      serviceInterest,
      subject,
      message,
      // Honeypot fields for anti-spam bots
      website_trap,
      bot_trap
    } = req.body;

    // Silent bot trap deflection
    if (website_trap || bot_trap) {
      console.warn('🤖 [Contact Routes] Bot honeypot triggered; returning simulated 200.');
      return res.status(200).json({
        success: true,
        message: 'Your inquiry has been successfully received.'
      });
    }

    // Input Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Please provide your name (at least 2 characters).'
      });
    }

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.'
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a message or requirement description of at least 10 characters.'
      });
    }

    const clientIp = req.headers['cf-connecting-ip'] ||
                     req.headers['x-forwarded-for']?.split(',')[0].trim() ||
                     req.socket?.remoteAddress ||
                     'unknown';

    const result = await service.processInquiry({
      name,
      email,
      phone,
      serviceInterest,
      subject,
      message,
      ip: clientIp
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('❌ [Contact Routes] Error processing inquiry:', err.message);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred while processing your request. Please try again shortly.'
    });
  }
});

module.exports = router;

