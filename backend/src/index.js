const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import the database connection module
const connectDB = require('./config/db');

const app = express();
app.set('trust proxy', 1);

// 1. Initialize Database Connection
connectDB();

// 2. Basic Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'https://portal.networkguru.com',
      'https://webflare.networkguru.com',
      'http://localhost',
      'http://localhost:5173',
    ],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-XSRF-TOKEN'],
    exposedHeaders: ['set-cookie'],
  })
);

// 3. Public Routes
app.use('/api/auth', require('./routes/auth'));

// 4. Protection Layer
const verifyCsrf = require('./middleware/csrfProtection');

// 5. Protected Routes
app.use('/api/orchestrator', verifyCsrf, require('./routes/orchestrator'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
