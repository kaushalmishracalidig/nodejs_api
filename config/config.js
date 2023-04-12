const dotenv = require("dotenv");
const path = require("path");

process.env.NODE_ENV = "test";

dotenv.config({
  path: path.join(__dirname, `../environment/.${process.env.NODE_ENV}.env`),
});

module.exports = {
  port: 2000,
  mongodburl:
    "mongodb+srv://user:user@cluster0.0hjucx2.mongodb.net/?retryWrites=true&w=majority",
  accessId: "AKIA24RUHOPBUQ5KCOMU",
  secretKey: "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",
  BUCKET_NAME: "my-app-backends",
};
