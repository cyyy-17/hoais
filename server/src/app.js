const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import Routes
const residentRoutes = require('./routes/residentRoutes');
const duesRoutes = require('./routes/duesRoutes');
const announcementRoutes = require('./routes/announcementRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Routes
app.use('/api/residents', residentRoutes);
app.use('/api/dues', duesRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/reports', reportRoutes);

const path = require('path');

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
