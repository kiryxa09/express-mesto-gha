const User = require('../models/user');
const httpConstants = require('http2').constants;
const { default: mongoose } = require('mongoose');

const getUsers = (req, res) => {
  User.find({})
    .then(users => res.send({ users }))
    .catch((e) => {
      if(e instanceof mongoose.Error.ValidationError){
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({message:'Переданы некорректные данные'});
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Произошла ошибка на сервере'});
      }
    });
};

const getUserbyId = (req, res) => {
  User.findById(req.params.userId)
    .then(user => res.send({ user }))
    .catch((e) => {
      if(e instanceof mongoose.Error.ValidationError){
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({message:'Переданы некорректные данные'});
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Произошла ошибка на сервере'});
      }
    });
};

const createUser = (req, res) => {
  const { name, about, avatar } = req.body;

  User.create({name, about, avatar})
    .then(user => res.send({ user }))
    .catch((e) => {
      if(e instanceof mongoose.Error.ValidationError){
        res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({message:'Переданы некорректные данные'});
      } else {
        res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Произошла ошибка на сервере'});
      }
    });
};

const deleteUser = (req, res) => {
  User.findByIdAndRemove(req.params.userId)
      .then(user => res.send({ user }))
      .catch((e) => {
        if(e instanceof mongoose.Error.DocumentNotFoundError) {
          res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({message: 'Пользователь не найден'});
        } else {
          res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Произошла ошибка на сервере'});
        }
      });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  User.findByIdAndUpdate(req.user._id, { name, about })
      .then(user => res.send({ user }))
      .catch((e) => {
        if(e instanceof mongoose.Error.ValidationError){
          res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({message:'Переданы некорректные данные'});
        } else if(e instanceof mongoose.Error.DocumentNotFoundError) {
          res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({message: 'Пользователь не найден'});
        } else {
          res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Произошла ошибка на сервере'});
        }
      });
};

const updateAvatar = (req, res) => {
  const {avatar} = req.body;
  User.findByIdAndUpdate(req.user._id, { avatar })
      .then(user => res.send({ user }))
      .catch((e) => {
        if(e instanceof mongoose.Error.ValidationError){
          res.status(httpConstants.HTTP_STATUS_BAD_REQUEST).send({message:'Переданы некорректные данные'});
        } else if(e instanceof mongoose.Error.DocumentNotFoundError) {
          res.status(httpConstants.HTTP_STATUS_NOT_FOUND).send({message: 'Пользователь не найден'});
        } else {
          res.status(httpConstants.HTTP_STATUS_INTERNAL_SERVER_ERROR).send({message: 'Произошла ошибка на сервере'});
        }
      });
}



module.exports = {
  getUsers,
  createUser,
  deleteUser,
  updateProfile,
  updateAvatar,
  getUserbyId
};