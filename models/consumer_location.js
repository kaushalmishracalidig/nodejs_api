const mongoose = require("mongoose");

const consumerLocationSchema = mongoose.Schema({
  consumer_id: {
    type: String,
  },
  address: {
    type: String,
  },
  lat: {
    type: String,
  },
  long: {
    type: String,
  },
  city: {
    type: String,
  },
});
consumerLocationSchema.index({ name: "location" });
module.exports = mongoose.model("ConsumerLocation", consumerLocationSchema);
