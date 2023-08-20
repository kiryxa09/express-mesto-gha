const router = require('express').Router();
const {
  getUsers, updateProfile, updateAvatar, getUserbyId, getUserInfo
} = require('../controllers/users');

router.get('/me', getUserInfo);
router.get('/:userId', getUserbyId);
router.get('/', getUsers);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
