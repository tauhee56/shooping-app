import { Router } from 'express';
import multer from 'multer';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './auth.controller';
import { firebaseAuthSchema, followUserSchema, loginSchema, registerSchema, updateProfileSchema } from './auth.validation';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.post('/register', validate(registerSchema), controller.register);
router.post('/login', validate(loginSchema), controller.login);
router.post('/firebase', validate(firebaseAuthSchema), controller.firebaseAuth);
router.get('/profile', auth, controller.getProfile);
router.put('/profile', auth, validate(updateProfileSchema), controller.updateProfile);
router.post('/profile-image', auth, upload.single('image'), controller.uploadProfileImage);
router.post('/follow/:userId', auth, validate(followUserSchema), controller.followUser);

export default router;
