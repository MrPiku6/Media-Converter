const cron = require('node-cron');
const fs = require('fs');
const path = require('path');

const UPLOAD_DIR = path.join(__dirname, '..', 'tmp', 'uploads');
const CONVERTED_DIR = path.join(__dirname, '..', 'tmp', 'converted');
const ONE_HOUR_IN_MS = 60 * 60 * 1000;

const cleanupDirectory = (directory) => {
  fs.readdir(directory, (err, files) => {
    if (err) {
      console.error(`Error reading directory ${directory}:`, err);
      return;
    }

    files.forEach((file) => {
      const filePath = path.join(directory, file);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error getting stats for file ${filePath}:`, err);
          return;
        }

        const now = new Date().getTime();
        const fileCreationTime = new Date(stats.birthtime).getTime();

        if (now - fileCreationTime > ONE_HOUR_IN_MS) {
          fs.unlink(filePath, (err) => {
            if (err) {
              console.error(`Error deleting file ${filePath}:`, err);
            } else {
              console.log(`Successfully deleted old file: ${filePath}`);
            }
          });
        }
      });
    });
  });
};

// Schedule a cron job to run every 5 minutes
const start = () => {
  cron.schedule('*/5 * * * *', () => {
    console.log('Running scheduled cleanup task...');
    cleanupDirectory(UPLOAD_DIR);
    cleanupDirectory(CONVERTED_DIR);
  });
};

module.exports = { start };
