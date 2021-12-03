const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const messages = require('../errors/errorsMessages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
  },

  email: {
    type: String,
    unique: true,
    required: true,
    validate: {
      validator(v) {
        return validator.isEmail(v);
      },
      message: messages.email,
    },
  },

  password: {
    type: String,
    select: false,
    minlength: 6,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password').then((user) => {
    if (!user) {
      return Promise.reject(new Error('Неверные данные'));
    }
    return bcrypt.compare(password, user.password).then((matched) => {
      if (!matched) {
        return Promise.reject(new Error('Неверные данные'));
      }
      return user;
    });
  });
};

module.exports = mongoose.model('user', userSchema);