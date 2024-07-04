const User = require('../model/User.model');
const bcrypt = require('bcryptjs');

exports.createNewUser = async (user) => {
  const genSalt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(user.password, genSalt);
  await User.create({ ...user, password: hashedPassword });
};

exports.findUserByEmail = async (email) => {
  return User.findOne({ where: { email } });
};
