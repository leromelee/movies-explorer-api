const router = require('express').Router();
const { userValidation } = require('../middlewares/validation');
const { getUser, updateUser, signOut } = require('../controllers/users');

router.get('/users/me', getUser);
router.patch('/users/me', userValidation, updateUser);
router.post('/signout', signOut);

module.exports = router;