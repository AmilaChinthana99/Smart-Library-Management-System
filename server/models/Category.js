const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#3B82F6', // Tailwind blue-500 default badge color
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);
