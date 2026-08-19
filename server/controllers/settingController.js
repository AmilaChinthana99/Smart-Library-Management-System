const Setting = require('../models/Setting');

// @desc    Get system settings
// @route   GET /api/settings
// @access  Public / Private
exports.getSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({});
    }
    res.json(setting);
  } catch (error) {
    next(error);
  }
};

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (Admin)
exports.updateSettings = async (req, res, next) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    const { fineRatePerDay, maxLoanDays, maxBooksPerMember, maxUnpaidFineThreshold, libraryName } = req.body;

    if (fineRatePerDay !== undefined) setting.fineRatePerDay = fineRatePerDay;
    if (maxLoanDays !== undefined) setting.maxLoanDays = maxLoanDays;
    if (maxBooksPerMember !== undefined) setting.maxBooksPerMember = maxBooksPerMember;
    if (maxUnpaidFineThreshold !== undefined) setting.maxUnpaidFineThreshold = maxUnpaidFineThreshold;
    if (libraryName) setting.libraryName = libraryName;

    await setting.save();

    res.json({
      message: 'Library settings updated successfully',
      setting,
    });
  } catch (error) {
    next(error);
  }
};
