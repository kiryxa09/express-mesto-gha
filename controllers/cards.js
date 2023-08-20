const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');
const Card = require('../models/card');
const BadReqError = require('../errors/bad-req-err');
const NotFoundError = require('../errors/not-found-err');
const UnAuthError = require('../errors/unauth-err');

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
      if (ownerId === req.user._id) {
        Card.findByIdAndRemove(req.params.cardId)
          .orFail()
          .then(() => res.send({ card }))
          .catch((e) => {
            if (e instanceof mongoose.Error.CastError) {
              throw new BadReqError('Переданы некорректные данные');
            } else if (e instanceof mongoose.Error.DocumentNotFoundError) {
              throw new NotFoundError('Карточка не найдена');
            }
          });
      } else {
        throw new UnAuthError('Карточка принадлежит не вам');
      }
    })
    .catch(next);
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
