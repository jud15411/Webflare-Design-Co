require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');
const customerRoutes = require('./routes/customers');
const contractRoutes = require('./routes/contracts');
const projectRoutes = require('./routes/projects');
const activityRoutes = require('./routes/activity');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Serve static files from the docs directory
app.use(express.static(path.join(__dirname, '../docs')));

// Routes
app.use('/api/admin/auth', authRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/contracts', contractRoutes);
app.use('/api/admin/projects', projectRoutes);
app.use('/api/admin/activity', activityRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/webflare-admin', {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}); 