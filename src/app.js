require('dotenv').config();

const express = require('express');
const cors = require('cors');

const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Backend = require('i18next-fs-backend');

const usersRouter = require('./routes/users.route');
const CustomError = require('./utils/CustomError');
const errorMiddleware = require('./middleware/errorMiddleware');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// app.use(express.static(path.join(__dirname, 'public')));

// Initialize i18next
i18next
  .use(Backend)
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './locales/{{lng}}/{{ns}}.json',
    },
  });

// Middleware to use i18next
app.use(i18nextMiddleware.handle(i18next));

app.use('/api/1.0/users', usersRouter);

app.use((req, _res, _next) => {
  throw new CustomError(404, `Requested URL not found: ${req.path}`);
});

// Global Error Handling
app.use(errorMiddleware);

module.exports = app;
