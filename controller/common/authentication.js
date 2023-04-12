const catchAsyncErrors = require("../../middleware/catchAsyncError");
const user = require("../../models/user");
const bcrypt = require("bcrypt");
const verification = require("../../models/store");
const q = require("q");
const AWS = require("aws-sdk");
const config = require("../../config/config");
const consumerLocation = require("../../models/consumer_location");

const accessId = config.accessId;
const secretKey = config.secretKey;
const BUCKET_NAME = config.BUCKET_NAME;

AWS.config.credentials = {
  accessKeyId: accessId,
  secretAccessKey: secretKey,
  region: "ap-south-1",
  ACL: "public-read",
};

AWS.config.region = "ap-south-1";

const s3 = new AWS.S3();

async function uploadMultipleFiles(fileObject) {
  const deferred = q.defer();
  let s3response = [];
  try {
    for (const file of fileObject) {
      const params = {
        Bucket: BUCKET_NAME,
        Key: file.key, // File name you want to save as in S3
        Body: file.value,
        ContentEncoding: "base64",
        ContentType: "image/jpeg",
      };
      const data = await s3.upload(params).promise();
      s3response.push({
        key: file.filekey,
        fileName: data.Key,
        Location: data.Location,
      });
    }
  } catch (err) {
    console.log(err);
  }
  deferred.resolve(s3response);
  return deferred.promise;
}

exports.loginUser = catchAsyncErrors(async (req, res) => {
  try {
    const { emailPhone, password, fcmToken, isEmail } = req.body;
    if (!emailPhone || !password) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Email , Password",
      });
    }

    let finduser;
    if (isEmail) {
      finduser = await user.findOne({ email: emailPhone });
    } else {
      finduser = await user.findOne({ phone: emailPhone });
    }

    if (!finduser) {
      return res.status(400).json({
        success: false,
        message: "User Not Found.",
      });
    }

    let userType = req.baseUrl.split("/")[2];

    if (userType !== finduser.userType) {
      return res
        .status(401)
        .json({ success: false, message: "Trying to access different panel." });
    }

    if (finduser.isActive === false) {
      return res.status(400).json({
        success: false,
        message: "User Is Inactive So You Cannot Login",
      });
    }

    if (finduser.isBlocked === true) {
      return res.status(200).json({
        success: true,
        message:
          "You have been blocked by the admin. Please contact admin to resume your account.",
      });
    }

    const token = finduser.getJwtToken();

    let ismatch = await bcrypt.compare(password, finduser.password);

    if (!ismatch) {
      res.status(400).json({
        success: false,
        message: "Incorrect Password",
      });
    }

    finduser.token = token;

    finduser.fcmToken = fcmToken;
    await finduser.save();

    let data = {
      name: finduser.name || "",
      email: finduser.email || "",
      phone: finduser.phone || "",
      token,
    };

    const token1 = Object.assign(finduser, { token });
    if (token1) {
      res.status(200).json({
        success: true,
        message: "Login succesfully ",
        data,
      });
      return;
    } else {
      res.status(400).json({
        success: false,
        message: "Login Unsuccesfully ",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "An error occured while logging in.",
    });
  }
});

// regiseter user
exports.registerUser = catchAsyncErrors(async (req, res) => {
  try {
    const { name, email, phone, password, fcmToken } = req.body;

    const finduser = await user.findOne({ $or: [{ email }, { phone }] });

    if (finduser) {
      return res.status(400).json({
        success: false,
        message: "user already exsit with same Email or Phone no.",
      });
    }

    // getting the userType from the url
    let typeOfUser = req.baseUrl.split("/")[2];

    // create a new device collection using deviceData
    // code...

    const createuser = await user.create({
      name,
      email,
      phone,
      password,
      userType: typeOfUser,
      isactive: false,
      fcmToken,
    });
    if (!createuser) {
      res.status(400).json({
        success: false,
        message: "cannot create user",
      });
    }

    const token = createuser.getJwtToken();
    const salt = await bcrypt.genSalt(10);
    createuser.password = await bcrypt.hash(createuser.password, salt);

    // await data.save();
    createuser.token = token;
    await createuser.save();

    let data = {
      name: createuser.name || "",
      email: createuser.email || "",
      phone: createuser.phone,
      token,
      isactive: createuser.isactive,
    };

    return res.status(200).json({
      success: true,
      message: "user register succesfully",
      data,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error occured while registering user",
      error,
    });
  }
});

// verify if the token is fine
exports.verifyToken = catchAsyncErrors(async (req, res) => {
  try {
    if (req.user) {
      let data = {
        name: req.user.name || "",
        email: req.user.email || "",
        phone: req.user.phone || "",
      };

      return res.status(200).json({
        success: true,
        message: "Token verified.",
        data,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Token Invalid.",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error occured while verifing admin token",
      error,
    });
  }
});

// logout user
exports.logoutUser = catchAsyncErrors(async (req, res) => {
  try {
    const userDetails = req.user;

    userDetails.token = "";
    if (userDetails.save()) {
      return res.status(200).json({
        success: true,
        message: "logout succesfully",
      });
    }

    return res.status(400).json({
      success: false,
      message: "There was some problem while logging out the user.",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error occured while logging out user",
      error,
    });
  }
});

exports.allUser = async (req, res) => {
  let { userType } = req.query;
  const users = await user.find({ userType: userType });

  if (!users) {
    res.status(200).json({
      success: true,
      message: "No Data Found",
      data: [],
    });
  }
  if (users.length !== 0) {
    res.status(200).json({
      success: true,
      message: "Data Found",
      data: users,
    });
  }

  if (users.length === 0) {
    res.status(200).json({
      success: true,
      message: "Data Empty",
      data: users,
    });
  }
};

exports.deleteUser = catchAsyncErrors(async (req, res) => {
  const users = await user.findByIdAndDelete(req.params.id);
  if (!users) {
    res.status(201).json({
      success: false,
      message: "Data not Found",
    });
  }

  if (users) {
    res.status(200).json({
      success: false,
      message: "User delete Successfully",
    });
  }
});

exports.editUser = catchAsyncErrors(async (req, res) => {
  const { name, email, phone, isActive, isBlocked } = req.body;
  const findUsers = await user.findByIdAndUpdate(
    req.params.id,
    {
      name: name,
      email: email,
      phone: phone,
      isActive: isActive,
      isBlocked: isBlocked,
      userType: "consumer",
      userType: "agent",
      userType: "business",
    },
    { new: true }
  );

  if (!findUsers) {
    res.status(401).json({
      success: false,
      message: "User not found",
    });
  }
  if (findUsers) {
    res.status(200).json({
      success: true,
      message: "User Edit Successfully",
      data: findUsers,
    });
  }
});

exports.getUserVerification = catchAsyncErrors(async (req, res) => {
  const userVerification = await verification.find({ user_id: req.params.id });
  const consumerVerification = await consumerLocation.find({
    consumer_id: req.params.id,
  });
  if (!userVerification) {
    res.status(401).json({
      success: false,
      message: "User not found",
    });
  }
  if (userVerification.length !== 0) {
    res.status(200).json({
      success: true,
      message: "User Verification",
      data: userVerification,
    });
  }

  if (consumerVerification.length !== 0) {
    res.status(200).json({
      success: true,
      message: "User Verification",
      data: consumerVerification,
    });
  }
});

exports.deleteUserVerification = catchAsyncErrors(async (req, res) => {
  const userVerification = await verification.findByIdAndDelete(req.params.id);
  if (!userVerification) {
    res.status(401).json({
      success: false,
      message: "User not found",
    });
  }
  if (userVerification) {
    res.status(200).json({
      success: true,
      message: "User Verification deleted Successfully",
    });
  }
});

exports.editUserVerification = catchAsyncErrors(async (req, res) => {
  let icon = "";
  if (req.files?.restaurantImage && req.files?.restaurantImage[0]) {
    let fileObject = [
      {
        key: req.files.restaurantImage[0].originalname,
        value: req.files.restaurantImage[0].buffer,
        filekey: "restaurantImage",
      },
    ];

    let newupdateobject = await uploadMultipleFiles(fileObject)
      .then((data) => {
        return data;
      })
      .catch((err) => {
        console.log(err);
      });

    icon = newupdateobject[0].Location;
  }
  const userVerification = await verification.findByIdAndUpdate(
    req.params.id,
    {
      ownerName: req.body.ownerName,
      businessRestaurantName: req.body.businessRestaurantName,
      businessRegistrationNumber: req.body.businessRegistrationNumber,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      lat: req.body.lat,
      long: req.body.long,
      city: req.body.city,
      restaurantImage: icon,
    },
    { new: true }
  );
  if (userVerification) {
    res.status(200).json({
      success: true,
      message: "User Verification edit Successfully",
    });
  }
});
