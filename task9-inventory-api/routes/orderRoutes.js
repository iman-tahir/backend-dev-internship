const express = require('express');
const c = require('../controllers/orderController');

const router = express.Router();

router.route('/').get(c.getOrders).post(c.createOrder);
router.route('/:id').get(c.getOrder).put(c.updateOrder).delete(c.deleteOrder);
router.patch('/:id/status', c.updateOrderStatus);

module.exports = router;