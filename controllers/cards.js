const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const BadReqError = require('../errors/bad-req-err');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbid-err');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        throw new BadReqError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => res.status(httpConstants.HTTP_STATUS_CREATED).send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.ValidationError) {
        throw new BadReqError('Переданы некорректные данные');
      }
    })
    .catch(next);
};

const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .orFail()
    .then((card) => {
      const ownerId = card.owner.toString();
      if (ownerId !== req.user._id) {
        return next(new ForbiddenError('Карточка принадлежит не вам'));
      }
      Card.findByIdAndRemove(req.params.cardId)
        .orFail()
        .then(() => res.send({ card }));
      return true;
    })
    .catch((e) => {
      if (e instanceof mongoose.Error.DocumentNotFoundError) {
        return next(new NotFoundError('Карточка не найдена'));
      }
      return next(e);
    });
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } }, // добавить _id в массив, если его там нет
    { new: true },
  )
    .orFail()
    .then((card) => res.send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        throw new BadReqError('Переданы некорректные данные');
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundError('Карточка не найдена');
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } }, // убрать _id из массива
    { new: true },
  )
    .orFail()
    .then((card) => res.send({ card }))
    .catch((e) => {
      if (e instanceof mongoose.Error.CastError) {
        throw new BadReqError('Переданы некорректные данные');
      } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
        throw new NotFoundError('Карточка не найдена');
      }
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
