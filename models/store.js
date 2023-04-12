const mongoose = require("mongoose");

const storeSchema = new mongoose.Schema({
  user_id: {
    type: String,
  },
  ownerName: {
    type: String,
  },
  businessRestaurantName: {
    type: String,
  },
  businessRegistrationNumber: {
    type: String,
  },
  openingTime: {
    type: String,
  },
  closingTime: {
    type: String,
  },
  restaurantImage: {
    type: String,
  },
  businessAddress: {
    type: String,
  },
  lat: {
    type: Number,
  },
  long: {
    type: Number,
  },
  city: {
    type: String,
  },
});

storeSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("verification", storeSchema);
