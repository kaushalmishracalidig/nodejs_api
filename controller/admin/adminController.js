const catchAsyncErrors = require("../../middleware/catchAsyncError");
const category = require("../../models/category");
const product = require("../../models/product");

exports.allCategory = catchAsyncErrors(async (req, res) => {
  const allCategories = await category.find({ addedBy: req.params.id });

  if (!allCategories) {
    res.status(200).json({
      success: true,
      message: "No Data Found",
      data: [],
    });
  }

  if (allCategories) {
    res.status(200).json({
      success: true,
      message: "Data Found",
      data: allCategories,
    });
  }
});

exports.deleteCategory = catchAsyncErrors(async (req, res) => {
  const deleteCategories = await category.findByIdAndDelete(req.params.id);

  if (!deleteCategories) {
    res.status(200).json({
      success: true,
      message: "No Data Found",
      data: [],
    });
  }

  if (deleteCategories) {
    res.status(200).json({
      success: true,
      message: "Category deleted",
      data: deleteCategories,
    });
  }
});

exports.allProduct = catchAsyncErrors(async (req, res) => {
  const allProducts = await product.find({ category: req.params.id });

  if (!allProducts) {
    res.status(200).json({
      success: true,
      message: "No Data Found",
      data: [],
    });
  }

  if (allProducts) {
    res.status(200).json({
      success: true,
      message: "Data Found",
      data: allProducts,
    });
  }
});

exports.deleteProduct = catchAsyncErrors(async (req, res) => {
  const deleteproducts = await product.findByIdAndDelete(req.params.id);

  if (!deleteproducts) {
    res.status(200).json({
      success: true,
      message: "No Data Found",
      data: [],
    });
  }

  if (deleteproducts) {
    res.status(200).json({
      success: true,
      message: "Product deleted",
      data: deleteCategories,
    });
  }
});
