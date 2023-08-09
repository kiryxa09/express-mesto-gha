const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(httpConstants.HTTP_STATUS_CREATED).send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .orFail()
    .then((card) => res.send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найден' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail()
    .then((card) => res.send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail()
    .then((card) => res.send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({ message: 'Карточка не найдена' });
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({ message: 'Произошла ошибка на сервере' });
      }
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
