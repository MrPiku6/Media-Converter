const express = require('express');
const router = express.Router();
const {
  uploadFile,
  convertFile,
  getJobStatus,
} = require('../controllers/mediaController');
const { protect } = require('../middleware/auth');
const { checkQuota } = require('../middleware/quota');
const upload = require('../middleware/upload');


// Apply the 'protect' middleware to all routes in this file
router.use(protect);

// Route to handle file uploads
router.post('/upload', upload, uploadFile);

// Route to start a conversion. Note the middleware order.
router.post('/convert', checkQuota, convertFile);

// Route to check the status of a job
router.get('/jobs/status/:jobId', getJobStatus);


module.exports = router;
