const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Import Routes
const authRoutes = require('./routes/authRoutes');
const residentRoutes = require('./routes/residentRoutes');
const duesRoutes = require('./routes/duesRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const reportRoutes = require('./routes/reportRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const path = require('path');
const { protect } = require('./middleware/auth');
const rateLimit = require('express-rate-limit');

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 requests per windowMs
  message: { error: 'Too many login attempts from this IP, please try again after 15 minutes' }
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
});

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'https://hoais.vercel.app', 'http://localhost:4173'], // Restrict to frontend domains
  credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Apply general limiter to all requests
app.use(generalLimiter);

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/residents', protect, residentRoutes);
app.use('/api/dues', protect, duesRoutes);
app.use('/api/maintenance', protect, maintenanceRoutes);
app.use('/api/facilities', protect, facilityRoutes);
app.use('/api/announcements', protect, announcementRoutes);
app.use('/api/reports', protect, reportRoutes);
app.use('/api/settings', protect, settingsRoutes);

// Serve frontend static files if in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client/dist/index.html'));
  });
} else {
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'HOA System API is running (Development)' });
  });
}

// Basic Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
