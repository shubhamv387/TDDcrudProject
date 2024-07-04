// const User = require('../model/User.model');
// const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { createNewUser } = require('../services/UserServices');
const asyncErrorHandler = require('../utils/asyncErrorHandler');

// @desc    Signup into this Web App
// @route   POST /api/1.0/users
// @access  Public
exports.signup = asyncErrorHandler(async (req, res, _next) => {
  const errors = validationResult(req);
  const user = req.body;
  if (!errors.isEmpty()) {
    const validationErrors = {};
    errors.array().forEach((error) => (validationErrors[error.path] = req.t(error.msg)));
    return res.status(400).send({ validationErrors });
  }

  await createNewUser(user);
  return res.status(201).send({ message: req.t('User created') });
});
