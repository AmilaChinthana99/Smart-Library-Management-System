const Category = require('../models/Category');
const Book = require('../models/Book');

// @desc    Get all categories with book counts
// @route   GET /api/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });

    // Attach book count for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const bookCount = await Book.countDocuments({ category: cat._id });
        return {
          ...cat.toObject(),
          bookCount,
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Librarian/Admin)
exports.createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;

    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    const category = await Category.create({ name, description, color });

    res.status(201).json({
      message: 'Category created successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Librarian/Admin)
exports.updateCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.color = color || category.color;

    await category.save();

    res.json({
      message: 'Category updated successfully',
      category,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Librarian/Admin)
exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if books are assigned to this category
    const bookCount = await Book.countDocuments({ category: category._id });
    if (bookCount > 0) {
      return res.status(400).json({
        message: `Cannot delete category. ${bookCount} books are currently categorized under it. Please reassign those books first.`,
      });
    }

    await category.deleteOne();

    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    next(error);
  }
};
