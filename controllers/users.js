const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
console.log(httpConstants);

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const getUserbyId = (req, res) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => res.send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar, email, password } = req.body;
  const hash = bcrypt.hash(password, 10);
  User.create({ name, about, avatar, email, password })
    .then((user) => res.status(httpConstants.HTTP_STATUS_CREATED).send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true, new: true })
    .orFail()
    .then((user) => res.send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .orFail()
    .then((user) => res.send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Пользователь не найден' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  return User.findUserByCredentials(email, password)
    .then((user) => {
      res.send({
        token: jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' }),
      });
    })
    .catch((err) => {
      res.status(httpConstants.HTTP_STATUS_UNAUTHORIZED).send({ message: err.message });
    });
};

module.exports = {
  getUsers,
  createUser,
  updateProfile,
  updateAvatar,
  getUserbyId,
  login,
};
