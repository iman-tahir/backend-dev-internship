const express = require('express');
const c = require('../controllers/productController');

const router = express.Router();

router.route('/').get(c.getProducts).post(c.createProduct);
router.route('/:id').get(c.getProduct).put(c.updateProduct).delete(c.deleteProduct);

module.exports = router;