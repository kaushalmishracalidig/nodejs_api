const mongoose = require("mongoose");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const user = mongoose.Schema(
  {
    name: {
      type: String,
    },
    email: {
      type: String,
      unique: true,
    },
    phone: {
      type: String,
    },
    password: {
      type: String,
    },
    userType: {
      type: String,
      enum: {
        values: ["consumer", "agent", "admin", "business"],
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    token: {
      type: String,
    },
    fcmToken: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

user.methods.comparePassword = async function (enteredpassword) {
  return await bcrypt.compare(enteredpassword, this.password);
};

user.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, "AGSYEVUUNHVSHUVEVHEYUEVLNBUEHOBO", {
    expiresIn: "7d",
  });
};

user.methods.reset = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetpassword = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetpasswordExpire = Date.now() + 30 * 60 * 1000;
  return resetToken;
};

user.index({ phone: "text" });

module.exports = mongoose.model("user", user);
