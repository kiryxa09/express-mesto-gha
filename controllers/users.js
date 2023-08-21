const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const BadReqError = require('../errors/bad-req-err');
const NotFoundError = require('../errors/not-found-err');
const UnAuthError = require('../errors/unauth-err');
const StatusConflictError = require('../errors/stat-confl-err');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadReqError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const getUserbyId = (req, res, next) => {
  User.findById(req.params.userId)
    .orFail()
    .then((user) => {
      res.send({ user });
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        throw new BadReqError('Переданы некорректные данные');
      } if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
    })
    .catch(next);
};

const createUser = (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  if (!email || !password) {
    throw new BadReqError('Переданы некорректные данные');
  }
  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => res
      .status(httpConstants.HTTP_STATUS_CREATED)
      .send({ user }))
    .catch((e) => {
      if (e.code === 11000) {
        throw new StatusConflictError('Email уже используется');
      } if (e instanceof mongoose.Error.ValidationError) {
        throw new BadReqError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const {
    name, about,
  } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about }, { runValidators: true, new: true })
    .orFail()
    .then((user) => res.send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadReqError('Переданы некорректные данные');
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar }, { new: true })
    .orFail()
    .then((user) => res.send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadReqError('Переданы некорректные данные');
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
    })
    .catch(next);
};

const login = (req, res, next) => {
  const {
    email, password,
  } = req.body;
  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', { expiresIn: '7d' });
      res
        .cookie('jwt', token, {
        // token - наш JWT токен, который мы отправляем
          maxAge: 3600000 * 24 * 7,
          httpOnly: true,
        });
      res.send({ user });
    })
    .catch((err) => {
      throw new UnAuthError(err.message);
    })
    .catch(next);
};

const getUserInfo = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => res.send({ user }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        throw new BadReqError('Переданы некорректные данные');
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundError('Пользователь с таким id не найден');
      }
    })
    .catch(next);
};

module.exports = {
  getUsers,
  createUser,
  updateProfile,
  updateAvatar,
  getUserbyId,
  login,
  getUserInfo,
};
