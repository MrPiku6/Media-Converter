const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const cronService = require('./services/cron');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Enable CORS (Cross-Origin Resource Sharing)
app.use(cors());

// --- Create temporary directories if they don't exist ---
const uploadsDir = path.join(__dirname, 'tmp', 'uploads');
const convertedDir = path.join(__dirname, 'tmp', 'converted');

if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log(`Created directory: ${uploadsDir}`);
}
if (!fs.existsSync(convertedDir)) {
    fs.mkdirSync(convertedDir, { recursive: true });
    console.log(`Created directory: ${convertedDir}`);
}


// --- Define and Mount Routers ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/media', require('./routes/media'));


// --- Serve static files for download ---
// This makes the 'tmp/converted' folder publicly accessible under the '/api/downloads' route
app.use('/api/downloads', express.static(path.join(__dirname, 'tmp', 'converted')));


// Start the cron job for cleaning up old files
cronService.start();

const PORT = process.env.PORT || 5000;

// THIS IS THE CORRECTED LINE FOR RENDER DEPLOYMENT
app.listen(PORT, '0.0.0.0', () => console.log(`Server started on port ${PORT}`));

// A simple test route to check if the API is running
app.get('/', (req, res) => {
    res.send('API is running successfully...');
});
