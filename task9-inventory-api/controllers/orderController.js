const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const { parsePagination, parseSort, addRange, searchFilter, paginate } = require('../utils/queryHelper');

const STATUSES = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
const SORT_FIELDS = ['createdAt', 'total', 'status', 'customerName'];

// Allowed status moves. Anything else returns 400.
const TRANSITIONS = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

// Put stock back (used on rollback and on cancellation)
const restoreStock = async (items) => {
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { stock: i.quantity } }))
  );
};

// GET /api/orders?status=&customer=&minTotal=&maxTotal=&product=&sort=&page=&limit=
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, customer, minTotal, maxTotal, product } = req.query;
  const filter = {};

  if (status) {
    if (!STATUSES.includes(status)) throw new AppError('Invalid status filter', 400);
    filter.status = status;
  }
  if (customer) filter.$or = searchFilter(customer, ['customerName', 'customerEmail']);
  if (product) {
    if (!mongoose.isValidObjectId(product)) throw new AppError('Invalid product id', 400);
    filter['items.product'] = product;
  }
  addRange(filter, 'total', minTotal, maxTotal);

  const options = {
    filter,
    sort: parseSort(req.query.sort, SORT_FIELDS, { createdAt: -1 }),
    ...parsePagination(req.query),
  };
  res.json(await paginate(Order, options, { path: 'items.product', select: 'name sku' }));
});

// GET /api/orders/:id
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('items.product', 'name sku');
  if (!order) throw new AppError('Order not found', 404);
  res.json({ data: order });
});

// POST /api/orders
// Body: { customerName, customerEmail, items: [{ product, quantity }] }
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerName, customerEmail, items } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400);
  }

  // Validate every item and merge duplicates of the same product
  const merged = new Map();
  for (const item of items) {
    if (!mongoose.isValidObjectId(item.product)) throw new AppError('Invalid product id in items', 400);
    const qty = Number(item.quantity);
    if (!Number.isInteger(qty) || qty < 1) {
      throw new AppError('Quantity must be a whole number of at least 1', 400);
    }
    const key = String(item.product);
    merged.set(key, (merged.get(key) || 0) + qty);
  }

  // Atomically deduct stock one product at a time; roll back if any fails
  const deducted = [];
  const orderItems = [];
  let total = 0;

  try {
    for (const [productId, quantity] of merged) {
      const product = await Product.findOneAndUpdate(
        { _id: productId, stock: { $gte: quantity } },
        { $inc: { stock: -quantity } },
        { new: true }
      );

      if (!product) {
        const exists = await Product.findById(productId).select('name stock');
        if (!exists) throw new AppError(`Product ${productId} not found`, 404);
        throw new AppError(
          `Insufficient stock for "${exists.name}": requested ${quantity}, available ${exists.stock}`,
          409
        );
      }

      deducted.push({ product: product._id, quantity });
      orderItems.push({ product: product._id, quantity, unitPrice: product.price });
      total += product.price * quantity;
    }

    const order = await Order.create({ customerName, customerEmail, items: orderItems, total });
    res.status(201).json({ data: order });
  } catch (err) {
    await restoreStock(deducted); // undo any deductions already made
    throw err;
  }
});

// PUT /api/orders/:id  — only customer details may change
exports.updateOrder = asyncHandler(async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    pick(req.body, ['customerName', 'customerEmail']),
    { new: true, runValidators: true }
  );
  if (!order) throw new AppError('Order not found', 404);
  res.json({ data: order });
});

// PATCH /api/orders/:id/status   Body: { status }
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  if (!STATUSES.includes(status)) throw new AppError('Invalid status', 400);

  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  if (!TRANSITIONS[order.status].includes(status)) {
    throw new AppError(`Cannot change status from ${order.status} to ${status}`, 400);
  }

  if (status === 'cancelled') await restoreStock(order.items);

  order.status = status;
  await order.save();
  res.json({ data: order });
});

// DELETE /api/orders/:id  — if still active, stock goes back first
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  if (['pending', 'confirmed'].includes(order.status)) await restoreStock(order.items);

  await order.deleteOne();
  res.json({ message: 'Order deleted' });
});