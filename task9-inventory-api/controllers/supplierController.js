const Supplier = require('../models/Supplier');
const Product = require('../models/Product');
const AppError = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const pick = require('../utils/pick');
const { parsePagination, parseSort, searchFilter, paginate } = require('../utils/queryHelper');

const FIELDS = ['name', 'email', 'phone', 'address'];
const SORT_FIELDS = ['name', 'email', 'createdAt'];

// GET /api/suppliers?search=&page=&limit=&sort=
exports.getSuppliers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.search) filter.$or = searchFilter(req.query.search, ['name', 'email']);

  const options = {
    filter,
    sort: parseSort(req.query.sort, SORT_FIELDS, { createdAt: -1 }),
    ...parsePagination(req.query),
  };
  res.json(await paginate(Supplier, options));
});

// GET /api/suppliers/:id
exports.getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new AppError('Supplier not found', 404);
  res.json({ data: supplier });
});

// POST /api/suppliers
exports.createSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.create(pick(req.body, FIELDS));
  res.status(201).json({ data: supplier });
});

// PUT /api/suppliers/:id
exports.updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findByIdAndUpdate(req.params.id, pick(req.body, FIELDS), {
    new: true,
    runValidators: true,
  });
  if (!supplier) throw new AppError('Supplier not found', 404);
  res.json({ data: supplier });
});

// DELETE /api/suppliers/:id  (blocked while products still reference it)
exports.deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) throw new AppError('Supplier not found', 404);

  const productCount = await Product.countDocuments({ supplier: supplier._id });
  if (productCount > 0) {
    throw new AppError(
      `Cannot delete supplier: ${productCount} product(s) still reference it`,
      409
    );
  }

  await supplier.deleteOne();
  res.json({ message: 'Supplier deleted' });
});