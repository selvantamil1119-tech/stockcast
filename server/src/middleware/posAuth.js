import User from '../models/User.js';

export const posAuth = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'POS API Key required. Pass your shop API key in the X-API-Key header.'
    });
  }

  try {
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API Key. Check your settings tab in StockCast.'
      });
    }

    req.userId = user._id ? user._id.toString() : user.id;
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ success: false, message: 'POS Authentication error: ' + error.message });
  }
};
