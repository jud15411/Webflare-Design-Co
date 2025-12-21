const User = require('../models/User');
const logger = require('../utils/logger');

exports.provisionUser = async (req, res) => {
  const { userName, email, firstName, lastName, password, branch, roleId } =
    req.body;
  try {
    const newUser = new User({
      userName,
      email,
      firstName,
      lastName,
      password,
      branch,
      role: roleId,
      status: 'active',
    });
    await newUser.save();
    logger.info('User provisioned', {
      admin: req.user.userName,
      newUser: userName,
    });
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
