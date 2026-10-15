const mongoose = require('mongoose');
const Product = require('../models/Product');
const Supplier = require('../models/Supplier');
const Order = require('../models/Order');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const {
  escapeRegex,
  parsePagination,
  parseSort,
  addRange,
  searchFilter,
  paginate,
} = require('../utils/queryHelper');

const FIELDS = ['name', 'sku', 'description', 'category', 'price', 'stock', 'supplier'];
const SORT_FIELDS = ['name', 'price', 'stock', 'category', 'createdAt'];

const assertSupplierExists = async (supplierId) => {
  if (!mongoose.isValidObjectId(supplierId)) throw new AppError('Invalid supplier id', 400);
  if (!(await Supplier.exists({ _id: supplierId }))) {
    throw new AppError('Supplier not found', 404);
  }
};

// GET /api/products?search=&category=&supplier=&minPrice=&maxPrice=&inStock=true&sort=&page=&limit=
exports.getProducts = asyncHandler(async (req, res) => {
  const { search, category, supplier, minPrice, maxPrice, inStock } = req.query;
  const filter = {};

  if (search) filter.$or = searchFilter(search, ['name', 'sku', 'description']);
  if (category) filter.category = new RegExp(`^${escapeRegex(String(category).trim())}$`, 'i');
  if (supplier) {
    if (!mongoose.isValidObjectId(supplier)) throw new AppError('Invalid supplier id', 400);
    filter.supplier = supplier;
  }
  addRange(filter, 'price', minPrice, maxPrice);
  if (inStock === 'true') filter.stock = { $gt: 0 };

  const options = {
    filter,
    sort: parseSort(req.query.sort, SORT_FIELDS, { createdAt: -1 }),
    ...parsePagination(req.query),
  };
  res.json(await paginate(Product, options, { path: 'supplier', select: 'name email' }));
});

// GET /api/products/:id
exports.getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('supplier', 'name email');
  if (!product) throw new AppError('Product not found', 404);
  res.json({ data: product });
});

// POST /api/products
exports.createProduct = asyncHandler(async (req, res) => {
  const body = pick(req.body, FIELDS);
  await assertSupplierExists(body.supplier);

  const product = await Product.create(body);
  res.status(201).json({ data: product });
});

// PUT /api/products/:id
exports.updateProduct = asyncHandler(async (req, res) => {
  const body = pick(req.body, FIELDS);
  if (body.supplier !== undefined) await assertSupplierExists(body.supplier);

  const product = await Product.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new AppError('Product not found', 404);
  res.json({ data: product });
});

// DELETE /api/products/:id  (blocked if any order contains it)
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw new AppError('Product not found', 404);

  if (await Order.exists({ 'items.product': product._id })) {
    throw new AppError('Cannot delete product: it appears in existing orders', 409);
  }

  await product.deleteOne();
  res.json({ message: 'Product deleted' });
});