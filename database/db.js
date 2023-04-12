const mongoose = require("mongoose");

mongoose
  .connect(
    "mongodb+srv://AnjaniMishra19:2IaBb2rPWaMC15kJ@cluster0.0hjucx2.mongodb.net/?retryWrites=true&w=majority"
  )
  .then(() => {
    console.log("connection success");
  })
  .catch((err) => console.log("connection failed"));
