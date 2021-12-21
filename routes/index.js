const express = require('express');

const { createUserValidation, loginValidation } = require('../middlewares/validation');
const messages = require('../errors/errorsMessages');
const { login, createUser, signOut } = require('../controllers/users');

const router = express.Router();
const userRouter = require('./users');
const movieRouter = require('./movies');

const NotFoundError = require('../errors/not-found');
const auth = require('../middlewares/auth');

router.post('/signup', createUserValidation, createUser);
router.post('/signin', loginValidation, login);
router.get('/crash-test', () => {
  setTimeout(() => {
    throw new Error(messages.crashTest);
  }, 0);
});
router.use(auth);
router.post('/signout', signOut);
router.use(userRouter);
router.use(movieRouter);
router.use('*', () => {
  throw new NotFoundError(messages.notFoundError);
});

module.exports = router;