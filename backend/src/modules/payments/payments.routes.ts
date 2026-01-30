import { Router } from 'express';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './payments.controller';
import { createIntentSchema, webhookSchema } from './payments.validation';

const router = Router();

router.post('/create-intent', auth, validate(createIntentSchema), controller.createIntent);
router.post('/webhook', validate(webhookSchema), controller.webhook);

export default router;
