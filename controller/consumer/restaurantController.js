const store = require("../../models/store");
const location = require("../../models/consumer_location");
const category = require("../../models/category");
const product = require("../../models/product");

exports.restaurants = async (req, res) => {
  try {
    const user = req.user;
    const consumerLocation = await location.findOne({ consumer_id: user._id });
    if (!consumerLocation) {
      return res.status(401).json({
        success: false,
        message: "location not found",
      });
    }
    const restaurant = await store.find({ city: consumerLocation.city });
    const data = {
      restaurant: restaurant,
    };
    if (restaurant) {
      return res.status(200).json({
        success: true,
        message: "Restaurant Details",
        data: data,
      });
    }
    return res.status(200).json({
      success: true,
      message: "Restaurant Details",
      data: [],
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};

exports.restaurantsById = async (req, res) => {
  try {
    const restaurant = await store.findById(req.params.id);
    if (!restaurant) {
      return res.status(401).json({
        success: false,
        message: "No Restaurant Details found",
        data: [],
      });
    }
    if (restaurant) {
      const categoryData = await category.find({ addedBy: restaurant.user_id });
      const productData = await product.find({ user_id: restaurant.user_id });
      const data = {
        restaurant,
        categoryData,
        productData,
      };
      return res.status(200).json({
        success: true,
        message: "Restaurant Details",
        data: data,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};
