require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database Connection
let mongoConnected = false;
mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    mongoConnected = true;
    console.log('✅ MongoDB connected');
  })
  .catch(err => {
    console.warn('⚠️  MongoDB connection failed - using in-memory database');
    console.warn('Error:', err.message);
    // In-memory DB will be used as fallback
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/messages', require('./routes/messages'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'Backend is running',
    db: mongoConnected ? 'MongoDB' : 'In-Memory Mock DB'
  });
});

// DB status endpoint
app.get('/api/db-status', (req, res) => {
  if (mongoConnected) {
    const mockDB = require('./db/mockDB');
    res.json({
      database: 'MongoDB',
      status: 'connected',
      mockData: mockDB.stats(),
    });
  } else {
    const mockDB = require('./db/mockDB');
    res.json({
      database: 'In-Memory Mock DB',
      status: 'active',
      data: mockDB.stats(),
      note: 'MongoDB not available - using in-memory storage',
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 Health: http://localhost:${PORT}/api/health`);
});

module.exports = app;
