import { Router } from 'express';
import multer from 'multer';
import auth from '../../middleware/auth';
import { validate } from '../../common/http/validate';
import * as controller from './stores.controller';
import {
  addProductToStoreSchema,
  createStoreSchema,
  storeIdSchema,
  storeProductIdSchema,
  updateProductSchema,
  updateStoreSchema,
} from './stores.validation';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/', controller.listStores);
router.post('/', auth, validate(createStoreSchema), controller.createStore);
router.get('/followed', auth, controller.getFollowedStores);
router.get('/mine', auth, controller.listMyStores);
router.get('/my', auth, controller.getMyStore);
router.post('/upload-logo', auth, upload.single('image'), controller.uploadStoreLogo);
router.post('/upload-banner', auth, upload.single('image'), controller.uploadStoreBanner);
router.post('/upload-product-images', auth, upload.array('images', 6), controller.uploadProductImages);
router.get('/:id', validate(storeIdSchema), controller.getStoreById);
router.put('/:id', auth, validate(updateStoreSchema), controller.updateStore);
router.post('/:id/products', auth, validate(addProductToStoreSchema), controller.addProductToStore);
router.put('/:id/products/:productId', auth, validate(updateProductSchema), controller.updateProduct);
router.delete('/:id/products/:productId', auth, validate(storeProductIdSchema), controller.deleteProduct);
router.post('/:id/follow', auth, validate(storeIdSchema), controller.followStore);

export default router;
