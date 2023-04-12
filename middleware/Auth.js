const jwt = require("jsonwebtoken");
const user = require("../models/user");

exports.isAuthenticated = async (req, res, next) => {
  try {
    const token = req.get("Authorization");

    if (!token) {
      res.status(400).json({
        success: false,
        message: "token not provide",
      });
      return;
    }

    const verfiyUser = jwt.verify(token, "AGSYEVUUNHVSHUVEVHEYUEVLNBUEHOBO");

    let userDetails = await user.findById(verfiyUser.id);
    let userType = req.baseUrl.split("/")[2];

    if (userType !== userDetails.userType) {
      return res
        .status(401)
        .json({ success: false, message: "Trying to access different panel." });
    }

    req.user = userDetails;

    next();
  } catch (err) {
    console.log(err);
    res.status(401).json({ success: false, message: "invalid token request " });
  }
};
