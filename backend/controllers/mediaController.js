const path = require('path');
const fs = require('fs');
const Ffmpeg = require('fluent-ffmpeg');
const User = require('../models/User');

const UPLOAD_DIR = path.join(__dirname, '..', 'tmp', 'uploads');
const CONVERTED_DIR = path.join(__dirname, '..', 'tmp', 'converted');

// In-memory job store. For a production app, use Redis or a database.
const jobs = {};

// @desc    Upload a video file
// @route   POST /api/media/upload
// @access  Private
const uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // The 'upload' middleware has already saved the file.
  // We just return the unique filename which will act as our file identifier.
  res.json({ fileId: req.file.filename });
};

// @desc    Convert a video file
// @route   POST /api/media/convert
// @access  Private
const convertFile = async (req, res) => {
  const { fileId, options } = req.body;
  
  // --- Input Validation and Sanitization ---
  // This is a CRITICAL step to prevent command injection.
  // Although fluent-ffmpeg helps, we must validate inputs.
  if (!fileId || typeof fileId !== 'string' || fileId.includes('..')) {
      return res.status(400).json({ message: 'Invalid fileId.' });
  }

  const inputPath = path.join(UPLOAD_DIR, fileId);

  // Check if the input file actually exists
  if (!fs.existsSync(inputPath)) {
      return res.status(404).json({ message: 'Uploaded file not found.' });
  }
  
  const jobId = `job-${Date.now()}`;
  const outputFileName = `${path.parse(fileId).name}.${options.format}`;
  const outputPath = path.join(CONVERTED_DIR, outputFileName);
  
  jobs[jobId] = {
      status: 'processing',
      progress: 0,
      outputFileName: null,
      error: null,
  };

  res.status(202).json({ jobId }); // Immediately return jobId to client

  try {
    const command = Ffmpeg(inputPath);

    // --- Dynamically Build FFmpeg Command ---
    // Universal Format and Codec
    if (options.format) command.toFormat(options.format);
    if (options.videoCodec) command.videoCodec(options.videoCodec);
    if (options.audioCodec) command.audioCodec(options.audioCodec);

    // Bitrate Control
    if (options.videoBitrate) command.videoBitrate(options.videoBitrate);
    
    // Editing Capabilities
    if (options.trim) command.setStartTime(options.trim.start).setDuration(options.trim.duration);
    if (options.resolution) command.size(options.resolution);
    if (options.framerate) command.fps(options.framerate);
    if (options.deinterlace) command.withOutputOption('-vf yadif'); // Example for direct option
    
    // Audio Controls
    if (options.disableAudio) command.noAudio();
    if (options.audioChannels) command.audioChannels(options.audioChannels);
    if (options.audioFrequency) command.audioFrequency(options.audioFrequency);
    if (options.audioBitrate) command.audioBitrate(options.audioBitrate);
    
    // --- Event Handlers ---
    command
      .on('progress', (progress) => {
        jobs[jobId].progress = progress.percent < 0 ? 0 : Math.round(progress.percent);
      })
      .on('end', async () => {
        console.log('Processing finished successfully');
        jobs[jobId].status = 'completed';
        jobs[jobId].progress = 100;
        jobs[jobId].outputFileName = outputFileName;
        
        // --- Update User Quota on Success ---
        const user = await User.findById(req.user.id);
        user.conversionCount += 1;
        user.lastConversionDate = new Date();
        await user.save();
      })
      .on('error', (err) => {
        console.error('Error during conversion:', err.message);
        jobs[jobId].status = 'failed';
        jobs[jobId].error = err.message;
        // Clean up failed output file
        if (fs.existsSync(outputPath)) {
          fs.unlinkSync(outputPath);
        }
      })
      .save(outputPath);

  } catch (error) {
      console.error('Error setting up FFmpeg command:', error);
      jobs[jobId].status = 'failed';
      jobs[jobId].error = 'Failed to initialize conversion process.';
  }
};

// @desc    Get the status of a conversion job
// @route   GET /api/media/jobs/status/:jobId
// @access  Private
const getJobStatus = (req, res) => {
  const { jobId } = req.params;
  const job = jobs[jobId];

  if (!job) {
    return res.status(404).json({ message: 'Job not found.' });
  }

  res.json(job);
};


module.exports = {
  uploadFile,
  convertFile,
  getJobStatus,
};
