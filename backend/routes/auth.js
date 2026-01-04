const express = require('express');
const router = express.Router();
const { register, login, getProfile, updateProfile, followUser } = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/follow/:userId', auth, followUser);

module.exports = router;
