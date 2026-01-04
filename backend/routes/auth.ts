
import { Router } from 'express';
import { register, login, getProfile, updateProfile, followUser } from '../controllers/authController';
import auth from '../middleware/auth';
const router = Router();


router.post('/register', register);
router.post('/login', login);
router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/follow/:userId', auth, followUser);

export default router;
