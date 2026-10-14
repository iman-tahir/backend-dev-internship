const Category = require('../models/Category');
const Product = require('../models/Product');

// POST /api/categories
const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res.status(201).json(category);
};

// GET /api/categories
const getCategories = async (req, res) => {
  const categories = await Category.find().sort({ name: 1 });
  res.json(categories);
};

// GET /api/categories/:id
const getCategoryById = async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
};

// PUT /api/categories/:id
const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json(category);
};

// DELETE /api/categories/:id
const deleteCategory = async (req, res) => {
  const productCount = await Product.countDocuments({ category: req.params.id });
  if (productCount > 0) {
    return res.status(400).json({
      message: `Cannot delete category: ${productCount} product(s) still use it`,
    });
  }

  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    return res.status(404).json({ message: 'Category not found' });
  }
  res.json({ message: 'Category deleted successfully' });
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};