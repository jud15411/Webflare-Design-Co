const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the docs directory
app.use(express.static(path.join(__dirname, 'docs')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});