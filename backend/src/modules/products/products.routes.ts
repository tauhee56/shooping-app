import { Router } from 'express';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './products.controller';
import { getAllProductsSchema, productIdSchema, productsByStoreSchema } from './products.validation';

const router = Router();

router.get('/featured', controller.getFeaturedProducts);
router.get('/', validate(getAllProductsSchema), controller.getAllProducts);
router.get('/liked', auth, controller.getLikedProducts);
router.get('/store/:storeId', validate(productsByStoreSchema), controller.getProductsByStore);
router.get('/:id', validate(productIdSchema), controller.getProductById);
router.post('/:id/like', auth, validate(productIdSchema), controller.likeProduct);

export default router;
