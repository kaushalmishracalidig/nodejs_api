const mongoose = require("mongoose");

const productSchema = mongoose.Schema(
  {
    image: {
      type: String,
    },
    category: {
      type: String,
    },
    name: {
      type: String,
    },
    price: {
      type: Number,
    },
    stockInfo: {
      type: Boolean,
    },
    description: {
      type: String,
    },
    prepTime: {
      type: String,
    },
    foodStatus: {
      type: Boolean,
    },
    isFreeDelivery: {
      type: Boolean,
    },
    deliveryRate: {
      type: Number,
    },
    preferenceMode: {
      type: Boolean,
    },
    preferencePrice: {
      type: String,
    },
    preferenceName: {
      type: String,
    },
    businessId: {
      type: String,
    },
    user_id: {
      type: String,
    },
    rating: {
      type: Number,
    },
    review: {
      type: Number,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
      },
    },
  }
);

productSchema.index({ name: "text" });

module.exports = mongoose.model("Product", productSchema);
