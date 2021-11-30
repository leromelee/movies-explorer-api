const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Users = require('../models/users');
const messages = require('../errors/errorsMessages');
const NotFoundError = require('../errors/not-found');
const BadRequestError = require('../errors/bad-request');
const UnauthorizedError = require('../errors/unauthorized');
const ConflictRequestError = require('../errors/conflicting-reques');

const { NODE_ENV, JWT_SECRET } = process.env;

const getUser = (req, res, next) => {
  Users.findById(req.user._id).then((user) => {
    if (!user) {
      throw new NotFoundError(messages.notFoundError);
    }
    res.status(200).send(user);
  })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const userId = req.user._id;
  const { name, email } = req.body;
  Users.findByIdAndUpdate(userId, { name, email }, { new: true, runValidators: true })
    .then((user) => {
      res.status(200).send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(messages.badRequestError);
      }
      if (err.code === 11000) {
        throw new ConflictRequestError(messages.conflictingError);
      }
      next(err);
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, password, email,
  } = req.body;
  Users.findOne({ email }).then((user) => {
    if (user) {
      throw new ConflictRequestError(messages.conflictingError);
    } else {
      return bcrypt.hash(password, 10);
    }
  })
    .then((hash) => User.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => {
      res.send({
        name: user.name,
        email: user.email,
      });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(messages.badRequestError);
      } else {
        next(err);
      }
    })
    .catch(next);
};

const signOut = (req, res) => {
  res.clearCookie('jwt').send(messages.cookiesDelete);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return Users.findUserByCredentials(email, password).then((user) => {
    const token = jwt.sign({ _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret', { expiresIn: '7d' });
    return res.cookie('jwt', token, {
      maxAge: 3600000 * 24 * 7,
      httpOnly: true,
      sameSite: true,
    }).send(messages.cookiesAdd);
  })
    .catch(() => {
      throw new UnauthorizedError(messages.unauthorizeError);
    })
    .catch(next);
};

module.exports = {
  createUser,
  getUser,
  updateUser,
  signOut,
  login,
};