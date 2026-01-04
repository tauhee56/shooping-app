
import { Router } from 'express';
import { getAllProducts, getProductById, likeProduct, getFeaturedProducts, getProductsByStore } from '../controllers/productController';
import auth from '../middleware/auth';
const router = Router();


router.get('/featured', getFeaturedProducts);
router.get('/', getAllProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/:id', getProductById);
router.post('/:id/like', auth, likeProduct);

export default router;
