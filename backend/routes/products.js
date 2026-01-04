const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  likeProduct,
  getFeaturedProducts,
  getProductsByStore,
} = require('../controllers/productController');
const auth = require('../middleware/auth');

router.get('/featured', getFeaturedProducts);
router.get('/', getAllProducts);
router.get('/store/:storeId', getProductsByStore);
router.get('/:id', getProductById);
router.post('/:id/like', auth, likeProduct);

module.exports = router;
