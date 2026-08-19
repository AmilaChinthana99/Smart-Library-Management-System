const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    fineRatePerDay: {
      type: Number,
      default: 1.5,
    },
    maxLoanDays: {
      type: Number,
      default: 14,
    },
    maxBooksPerMember: {
      type: Number,
      default: 5,
    },
    maxUnpaidFineThreshold: {
      type: Number,
      default: 10.0,
    },
    libraryName: {
      type: String,
      default: 'Smart Digital Library System',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Setting', settingSchema);
