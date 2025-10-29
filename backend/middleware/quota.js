const User = require('../models/User');

const checkQuota = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of the day

    // Check if the last conversion was on a previous day
    if (user.lastConversionDate && user.lastConversionDate < today) {
      user.conversionCount = 0; // Reset count
      user.lastConversionDate = null; // Reset date
    }

    const DAILY_LIMIT = 10;
    if (user.conversionCount >= DAILY_LIMIT) {
      return res.status(403).json({
        message: 'You have reached your daily limit of 10 conversions.',
      });
    }

    // If quota is fine, proceed to the next middleware/controller
    next();

  } catch (error) {
    console.error('Quota check error:', error);
    res.status(500).send('Server error during quota check');
  }
};

module.exports = { checkQuota };
