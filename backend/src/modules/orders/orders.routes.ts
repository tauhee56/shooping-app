import { Router } from 'express';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './orders.controller';
import { createOrderSchema, orderIdSchema, updateOrderStatusSchema } from './orders.validation';

const router = Router();

router.post('/', auth, validate(createOrderSchema), controller.createOrder);
router.get('/', auth, controller.getMyOrders);
router.get('/:id', auth, validate(orderIdSchema), controller.getOrderById);
router.put('/:id/status', auth, validate(updateOrderStatusSchema), controller.updateOrderStatus);

export default router;
