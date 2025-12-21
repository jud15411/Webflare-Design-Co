const express = require('express');
const router = express.Router();
const logger = require('../utils/logger'); // Your actual backend logger

router.post('/frontend', (req, res) => {
  const { message, stack, url, userAgent } = req.body;

  // Pass the frontend error into your professional backend logging system
  logger.error(`Frontend Error: ${message}`, {
    stack,
    url,
    userAgent,
    source: 'REACT_UI',
  });

  res.status(200).json({ success: true });
});

module.exports = router;
