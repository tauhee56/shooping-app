
import { Router } from 'express';
import { createStore, getStoreById, getMyStore, updateStore, addProductToStore, followStore, updateProduct, deleteProduct } from '../controllers/storeController';
import auth from '../middleware/auth';
const router = Router();


router.post('/', auth, createStore);
router.get('/my', auth, getMyStore);
router.get('/:id', getStoreById);
router.put('/:id', auth, updateStore);
router.post('/:id/products', auth, addProductToStore);
router.put('/:id/products/:productId', auth, updateProduct);
router.delete('/:id/products/:productId', auth, deleteProduct);
router.post('/:id/follow', auth, followStore);

export default router;
