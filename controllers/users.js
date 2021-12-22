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
  Users.findById(req.user._id)
    .orFail(new Error(messages.notFoundError))
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === 'CastError') {
        throw new BadRequestError(messages.badRequestError);
      } else if (err.message === 'NotFound') {
        throw new NotFoundError(messages.notFoundError);
      }
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { name, email } = req.body;

  Users.findByIdAndUpdate(req.user._id, { name, email }, { runValidators: true, new: true })
    .then((user) => {
      if (!user) {
        throw new NotFoundError(messages.notFoundError);
      } else {
        res.send(user);
      }
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(messages.badRequestError);
      } else if (err.name === 'CastError') {
        throw new BadRequestError(messages.badRequestError);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictRequestError(messages.conflictingError);
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => Users.create({
      name,
      email,
      password: hash,
    }))
    .then((user) => res.send({
      name: user.name,
      email: user.email,
    }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new BadRequestError(messages.badRequestError);
      } else if (err.name === 'MongoError' && err.code === 11000) {
        throw new ConflictRequestError(messages.conflictingError);
      }
    })
    .catch(next);
};

const signOut = (req, res) => {
  res.clearCookie('jwt').send(messages.cookiesDelete);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  Users.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new Error(messages.unauthorizeError));
      }
      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new Error(messages.unauthorizeError));
        }
        return user;
      });
    })
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'super-strong-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    // eslint-disable-next-line no-unused-vars
    .catch((err) => {
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
