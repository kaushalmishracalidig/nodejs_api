const store = require("../../models/store");
const config = require("../../config/config");
const catchAsyncErrors = require("../../middleware/catchAsyncError");
const q = require("q");
const AWS = require("aws-sdk");

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

exports.saveVerificationBusinessData = async (req, res) => {
  try {
    const user = req.user;
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

    const businessData = await store.findByIdAndUpdate(
      user._id,
      {
        ownerName: req.body.ownerName,
        businessRegistrationNumber: req.body.businessRegistrationNumber,
        businessAddress: req.body.businessAddress,
        businessRestaurantName: req.body.businessRestaurantName,
        openingTime: req.body.openingTime,
        closingTime: req.body.closingTime,
        lat: req.body.lat,
        long: req.body.long,
        city: req.body.city,
        restaurantImage: icon,
      },
      { new: true }
    );
    if (businessData) {
      await businessData.updateOne(icon);
      return res.json({
        success: true,
        message: "business document updated",
      });
    }

    const createbusinessVerification = await store.create({
      user_id: req.user._id,
      ownerName: req.body.ownerName,
      businessRegistrationNumber: req.body.businessRegistrationNumber,
      businessAddress: req.body.businessAddress,
      businessRestaurantName: req.body.businessRestaurantName,
      openingTime: req.body.openingTime,
      closingTime: req.body.closingTime,
      lat: req.body.lat,
      long: req.body.long,
      city: req.body.city,
      restaurantImage: icon,
    });

    if (!createbusinessVerification) {
      res.status(400).json({
        success: false,
        message: "cannot create store document",
      });
    }
    return res.status(200).json({
      success: true,
      message: "business document successfully saved",
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};

// get agent verification data
exports.getVerificationData = catchAsyncErrors(async (req, res) => {
  try {
    const user = req.user;

    const businessData = await store.find({ user_id: user._id });

    if (businessData) {
      return res.json({
        success: true,
        data: businessData,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Documents not yet submitted.",
      data: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "An error occured while getting business verification details.",
    });
  }
});

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
