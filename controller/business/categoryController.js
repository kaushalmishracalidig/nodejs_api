const q = require("q");
const AWS = require("aws-sdk");
const config = require("../../config/config");
const category = require("../../models/category");

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
        fileName: data.key,
        Location: data.Location,
      });
    }
  } catch (err) {
    console.log(err);
  }
  deferred.resolve(s3response);
  return deferred.promise;
}

exports.addCategory = async (req, res) => {
  try {
    const user = req.user;

    let icon = "";
    if (req.files?.icon && req.files?.icon[0]) {
      let fileObject = [
        {
          key: req.files.icon[0].originalname,
          value: req.files.icon[0].buffer,
          filekey: "icon",
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
    console.log("usvs", icon);
    const categoryData = await category.create({
      name: req.body.name,
      icon: icon,
      addedBy: user._id,
    });

    console.log("mjjd", categoryData);

    res.status(200).json({
      success: true,
      message: "catgeory added",
      data: categoryData,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const user = req.user;

    const categories = await category
      .find({ addedBy: user._id })
      .select("-addedBy");
    if (!categories) {
      return res.status(400).json({
        success: false,
        message: "cannot find category",
      });
    }

    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong while getting categories",
      data: err,
    });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const user = req.user;

    const { name } = req.body;

    let icon = "";
    if (req.files?.icon && req.files?.icon[0]) {
      let fileObject = [
        {
          key: req.files.icon[0].originalname,
          value: req.files.icon[0].buffer,
          filekey: "icon",
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

    const findCategory = await category.findById(req.params.id);

    if (!findCategory) {
      return res.status(400).json({
        success: false,
        error: "Not Find This Record",
      });
    }

    console.log("tus", findCategory);

    const updateCategory = await category.findByIdAndUpdate(
      req.params.id,
      {
        name: name || findCategory.name,
        icon: icon || findCategory.icon,
      },
      { new: true }
    );

    if (!updateCategory) {
      return res.status(400).json({
        success: false,
        error: "Unable To Update The Record",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Category Is Updated",
      data: updateCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Update Agent Is Not Possible",
    });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const user = req.user;

    await category.findByIdAndDelete(req.params.id);
    return res.json({
      success: true,
      message: "Successfully deleted category",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Someting went wrong while deleting category",
    });
  }
};
