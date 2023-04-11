const User = require('../models/user.model');
const fs = require('fs')

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

exports.updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.name = req.body.name || user.name;

    if (req.body.image_filename) {
        user.image = {
            data: fs.readFileSync(req.body.image_filename),
            contentType: 'image/png'
        };
    } else {
        user.image = user.image;
    }

    await user.save();

    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
};

