const express = require('express');
const { signup } = require('../controller/users.controller');
const router = express.Router();
const UserServices = require('../middleware/inputFieldValidation');

/* GET users listing. */
router.get('/', function (req, res, _next) {
  res.status(200).json({ message: 'Working good' });
});

// const validateUsername = (req, res, next) => {
//   if (!req.body.username) {
//     req.validationErrors = {
//       username: 'Username cannot be null',
//     };
//   }
//   next();
// };

// const validateEmail = (req, res, next) => {
//   if (!req.body.email) {
//     req.validationErrors = {
//       ...req.validationErrors,
//       email: 'E-mail cannot be null',
//     };
//   }
//   next();
// };

router.post(
  '/',
  UserServices.validateUsername('username'),
  UserServices.validateEmail('email'),
  UserServices.validatePassword('password'),
  signup,
);

router.post('/token/:token', async (req, res, _next) => {
  const token = req.params.token;
  try {
    await UserServices.activate(token);
  } catch (err) {
    return res.status(400).json({ message: req.t(err.message) });
  }
  res.json({ message: req.t('account_activation_success') });
});

module.exports = router;
