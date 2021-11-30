const router = require('express').Router();
const { userValidation } = require('../middlewares/validation');
const { getUser, updateUser } = require('../controllers/users');

router.get('/users/me', getUser);
router.patch('/users/me', userValidation, updateUser);

module.exports = router;