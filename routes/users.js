const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers, updateProfile, updateAvatar, getUserbyId, getUserInfo,
} = require('../controllers/users');

router.get('/me', getUserInfo);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().alphanum().length(24).hex(),
  }),
}), getUserbyId);
router.get('/', getUsers);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), updateProfile);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/https?:\/\/w?w?w?[\w-\._~:/?#\[]@!$&'\(\)*\+,;=]{2,}#?/),
  }),
}), updateAvatar);

module.exports = router;
