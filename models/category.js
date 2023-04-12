const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  icon: {
    type: String,
  },
  addedBy: {
    type: String,
  },
});

module.exports = mongoose.model("Menu", categorySchema);
