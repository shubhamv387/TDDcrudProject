// const User = require('../model/User.model');
// const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer')
const { validationResult } = require('express-validator')
const { createNewUser } = require('../services/UserServices')
const asyncErrorHandler = require('../utils/asyncErrorHandler')

// @desc    Signup into this Web App
// @route   POST /api/1.0/users
// @access  Public
exports.signup = asyncErrorHandler(async (req, res, _next) => {
  const errors = validationResult(req)
  const user = req.body
  if (!errors.isEmpty()) {
    const validationErrors = {}
    errors.array().forEach((error) => (validationErrors[error.path] = req.t(error.msg)))
    return res.status(400).json({ validationErrors })
  }

  await createNewUser(user)

  const token = 'adhsjdksndhfndssj'

  // Create a SMTP transporter object
  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
      user: process.env.ETHEREAL_USERNAME,
      pass: process.env.ETHEREAL_PASSWORD,
    },
  })

  // Message object
  let mailOptions = {
    from: 'TDD Curd Api <info@tdd-crud-api.com>',
    to: `${user.username} <${user.email}>`,
    subject: 'Account activation details',
    html: `<p><b>Please click the link given below to activate your account</b></p><a href="http://localhost:3000/login?token=${token}">Click Here</a>`,
  }

  const promise = new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.log('Error occurred. ' + err.message)
        return reject('Error occurred. ' + err.message)
      }

      console.log('Message sent: %s', info.messageId)
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info))
      resolve()
    })
  })

  await promise

  return res
    .status(201)
    .json({ success: true, message: req.t(req.t('account_activation_link', { email: user.email })) })
})
