const express = require('express');
const router = express.Router();
const {
  createStore,
  getStoreById,
  getMyStore,
  updateStore,
  addProductToStore,
  followStore,
  updateProduct,
  deleteProduct,
} = require('../controllers/storeController');
const auth = require('../middleware/auth');

router.post('/', auth, createStore);
router.get('/my', auth, getMyStore);
router.get('/:id', getStoreById);
router.put('/:id', auth, updateStore);
router.post('/:id/products', auth, addProductToStore);
router.put('/:id/products/:productId', auth, updateProduct);
router.delete('/:id/products/:productId', auth, deleteProduct);
router.post('/:id/follow', auth, followStore);

module.exports = router;
