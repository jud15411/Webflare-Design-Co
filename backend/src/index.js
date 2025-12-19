const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser'); // Ensure this is imported
// const PERMISSIONS = require('../config/permissions');
// const authorize = require('../middleware/authorize');
require('dotenv').config();

const app = express();
app.set('trust proxy', 1);

// 1. Basic Middleware
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: ['http://portal.networkguru.com', 'http://100.124.76.20'],
    credentials: true,
  })
);

// 2. Database Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Could not connect', err));

// 3. Public Routes (No CSRF check)
// Your auth.js file contains the login logic
app.use('/api/auth', require('./routes/auth'));

// 4. Protection Layer
const verifyCsrf = require('./middleware/csrfProtection');

app.use('/api/orchestrator', require('./routes/orchestrator'));

// 5. Protected Routes
// ONLY add routes here once you have created the physical files for them
// app.use('/api/admin', verifyCsrf, require('./routes/adminRoutes'));

// router.post('/deploy',
//   authenticateToken, // Validates the JWT
//   authorize(PERMISSIONS.WEB_DEPLOY_PROD),
//   (req, res) => {
//     // Deploy logic here
// });

app.listen(5000, () => console.log('Server running on port 5000'));
