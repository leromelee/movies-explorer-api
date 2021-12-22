require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const helmet = require('helmet');
const { errors } = require('celebrate');
const bodyParser = require('body-parser');
const errorsHandler = require('./middlewares/error');
const router = require('./routes/index');
const limiter = require('./middlewares/limiter');
const { dbMovies, PORT } = require('./utils/constants');
const { requestLogger, errorLogger } = require('./middlewares/logger');

const app = express();

mongoose.connect(dbMovies, {
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(requestLogger);
app.use(cookieParser());
app.use(cors());

app.use(helmet());
app.use(limiter);
app.use(router);
app.use('/', express.json());

app.use(errorLogger);
app.use(errors());
app.use(errorsHandler);

app.listen(PORT, () => {
  console.log(`Запущено на порте: ${PORT}`);
});
