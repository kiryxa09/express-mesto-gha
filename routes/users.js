const router = require('express').Router();
const { getUsers, createUser, deleteUser, updateProfile, updateAvatar, getUserbyId } = require('../controllers/users')

router.post('/', createUser);
router.delete('/:userId', deleteUser);
router.get('/:userId', getUserbyId);
router.get('/', getUsers);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);




module.exports = router;
