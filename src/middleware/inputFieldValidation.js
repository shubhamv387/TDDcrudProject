const { check } = require('express-validator')
const { findUserByEmail } = require('../services/UserServices')

exports.validateUsername = (field) =>
  check(field)
    .notEmpty()
    .withMessage('Username cannot be null')
    .bail()
    .isLength({ min: 4, max: 32 })
    .withMessage('Must have min 4 and max 32 characters')

exports.validateEmail = (field) =>
  check(field)
    .notEmpty()
    .withMessage('E-mail cannot be null')
    .bail()
    .isEmail()
    .withMessage('E-mail is not valid')
    .bail()
    .custom(async (email) => {
      const existingUser = await findUserByEmail(email)
      if (existingUser) throw new Error('E-mail already exists')
    })

exports.validatePassword = (field) =>
  check(field)
    .notEmpty()
    .withMessage('Password cannot be null')
    .bail()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
    .bail()
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/)
    .withMessage('Password must have at least 1 uppercase, 1 lowercase, and 1 number')
