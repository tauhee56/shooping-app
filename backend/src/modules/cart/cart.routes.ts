import { Router } from 'express';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './cart.controller';
import {
  addCartItemSchema,
  checkoutCartSchema,
  getCartSchema,
  removeCartItemSchema,
  updateCartItemSchema,
} from './cart.validation';

const router = Router();

router.get('/', auth, validate(getCartSchema), controller.getCart);
router.post('/checkout', auth, validate(checkoutCartSchema), controller.checkout);
router.post('/items', auth, validate(addCartItemSchema), controller.addItem);
router.put('/items/:productId', auth, validate(updateCartItemSchema), controller.updateItem);
router.delete('/items/:productId', auth, validate(removeCartItemSchema), controller.removeItem);

export default router;
