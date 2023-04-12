// get by id and update and delete

const Product = require("../../models/product");
const AWS = require("aws-sdk");
const config = require("../../config/config");

const accessId = config.accessId;
const secretKey = config.secretKey;
const BUCKET_NAME = config.BUCKET_NAME;
const q = require("q");
const Business = require("../../models/store");

AWS.config.credentials = {
  accessKeyId: accessId,
  secretAccessKey: secretKey,
  region: "ap-south-1",
  ACL: "public-read",
};

AWS.config.region = "ap-south-1";

const s3 = new AWS.S3();

exports.addProduct = async (req, res) => {
  try {
    const user = req.user;
    const business = await Business.findOne({ user_id: req.user._id });

    if (!business) {
      return res.status(401).json({
        message: "No Business Details Found",
        success: false,
      });
    }

    let imageBanner = "";
    if (req.files?.image && req.files?.image[0]) {
      let fileObject = [
        {
          key: req.files.image[0].originalname,
          value: req.files.image[0].buffer,
          filekey: "image",
        },
      ];

      let newupdateobject = await uploadMultipleFiles(fileObject)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          console.log(err);
        });

      imageBanner = newupdateobject[0].Location;
    }

    const product = await Product.create({
      image: imageBanner,
      category: req.body.category,
      name: req.body.name,
      price: req.body.price,
      stockInfo: req.body.stockInfo,
      prepTime: req.body.prepTime,
      description: req.body.description,
      foodStatus: req.body.foodStatus,
      isFreeDelivery: req.body.isFreeDelivery,
      deliveryRate: req.body.deliveryRate,
      preferenceMode: req.body.preferenceMode,
      preferencePrice: req.body.preferencePrice,
      preferenceName: req.body.preferenceName,
      businessId: business._id,
      user_id: user._id,
      rating: req.body.rating,
      review: req.body.review,
    });

    res.status(200).json({
      success: true,
      message: "product added",
      data: product,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Something went wrong", err });
  }
};

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

// get all my products
exports.getProduct = async (req, res) => {
  try {
    const business = await Business.findOne({ user_id: req.user._id });
    if (!business) {
      res.status(400).json({
        message: "No Business Details Found",
        success: false,
      });
    }
    const myProducts = await Product.find({ businessId: business._id });
    if (myProducts) {
      return res.status(200).json({
        success: true,
        count: myProducts.length,
        data: myProducts,
      });
    }
    res.status(400).json({
      message: "Not able to find the product",
      success: false,
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Something went wrong" });
  }
};

// get my product details by id
exports.getProductById = async (req, res, next) => {
  try {
    const business = await Business.findOne({ user_id: req.user._id });

    if (!business) {
      return res.status(401).json({
        message: "No Business Details Found",
        success: false,
      });
    }

    const product = await Product.findOne({
      _id: req.params.id,
      businessId: business._id,
    });
    if (product) {
      return res.status(200).json({
        success: true,
        data: product,
      });
    }
    return res.status(400).json({
      message: "cannot find product",
      success: false,
    });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong while fetching the product" });
  }
};

exports.getallProduct = async (req, res) => {
  try {
    const AllProduct = await Product.find()
      .populate("user_id")
      .populate("bussinessOwner_id")
      .populate("Catgeory")
      .populate("menu");
    if (!AllProduct) {
      res.status(400).json({
        success: false,
        message: "internal server error",
      });
      return;
    }
    if (AllProduct) {
      res.status(200).json({
        message: "data Found",
        success: true,
        count: AllProduct.length,
        data: AllProduct,
      });
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};

exports.getAllProductOfBussinessOwnerAndUser = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        message: "Please Provide BussinessId",
      });
      return;
    }

    const findProduct = await Product.find({
      $or: [{ bussinessOwner_id: id }, { user_id: id }],
    })
      .populate("bussinessOwner_id")
      .populate("user_id")
      .populate("menu")
      .populate("Catgeory");

    if (!findProduct) {
      res.status(400).json({
        success: false,
        message: "Unable to find product",
      });
      return;
    }

    if (findProduct) {
      res.status(200).json({
        success: true,
        message: "Product found",
        Product: findProduct,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "All Product Of User And Bussines Owner Is Not Get",
    });
  }
};

exports.productFiltters = async (req, res) => {
  try {
    const { freeDelivery, isPromoted, high, percentageOff } = req.body;
    let value = high ? -1 : 1;
    let percentage = percentageOff ? -1 : 1;
    let freeDeliveryIsPromotedProduct, isPromotedProduct, freeDeliveryProduct;
    let freeDeliveryIsPromotedProduct1 = [],
      isPromotedProduct1 = [],
      freeDeliveryProduct1 = [];
    let status = 0;
    if (freeDelivery === true && isPromoted === true) {
      freeDeliveryIsPromotedProduct = await Product.find({
        isFreeDelivery: true,
        isPromoted: true,
      })
        .sort({ Price: value })
        .where("percentageOff")
        .gt(percentage)
        .populate("bussinessOwner_id")
        .populate("Catgeory");
      // console.log(percentage , "percentage")
      for (let i = 0; i < freeDeliveryIsPromotedProduct.length; i++) {
        status = 0;

        for (let j = 0; j < freeDeliveryIsPromotedProduct1.length; j++) {
          if (
            freeDeliveryIsPromotedProduct1[j]._id ==
            freeDeliveryIsPromotedProduct[i].bussinessOwner_id._id
          ) {
            status = 1;
          }
        }

        if (status == 0) {
          freeDeliveryIsPromotedProduct1.push(
            freeDeliveryIsPromotedProduct[i].bussinessOwner_id
          );
        }
      }
    }

    if (freeDelivery === true && isPromoted === false) {
      console.log(
        await Product.find({ isFreeDelivery: true, isPromoted: false })
      );
      freeDeliveryProduct = await Product.find({
        isFreeDelivery: true,
        isPromoted: false,
      })
        .sort({ Price: value })
        .where("percentageOff")
        .gt(percentage)
        .populate("bussinessOwner_id")
        .populate("Catgeory");

      console.log(freeDeliveryProduct, "freeDeliveryProduct");
      console.log(percentage, "percentage");
      for (let i = 0; i < freeDeliveryProduct.length; i++) {
        status = 0;

        for (let j = 0; j < freeDeliveryProduct1.length; j++) {
          if (
            freeDeliveryProduct1[j]._id ==
            freeDeliveryProduct[i].bussinessOwner_id._id
          ) {
            status = 1;
          }
        }

        if (status == 0) {
          freeDeliveryProduct1.push(freeDeliveryProduct[i].bussinessOwner_id);
        }
      }

      // for (let i = 0; i < freeDeliveryProduct.length; i++) {
      //     freeDeliveryProduct1.push(freeDeliveryProduct[i].bussinessOwner_id)
      // }
    }

    if (isPromoted === true && freeDelivery === false) {
      isPromotedProduct = await Product.find({
        isPromoted: true,
        isFreeDelivery: false,
      })
        .sort({ Price: value })
        .where("percentageOff")
        .gt(percentage)
        .populate("bussinessOwner_id")
        .populate("Catgeory");

      console.log(isPromotedProduct);
      for (let i = 0; i < isPromotedProduct.length; i++) {
        status = 0;

        for (let j = 0; j < isPromotedProduct1.length; j++) {
          if (
            isPromotedProduct1[j]._id ==
            isPromotedProduct[i].bussinessOwner_id._id
          ) {
            status = 1;
          }
        }

        if (status == 0) {
          isPromotedProduct1.push(isPromotedProduct[i].bussinessOwner_id);
        }
      }

      // for (let i = 0; i < isPromotedProduct.length; i++) {
      //     isPromotedProduct1.push(isPromotedProduct[i].bussinessOwner_id)
      // }
    }

    if (freeDelivery === true && isPromoted === true) {
      res.status(200).json({
        success: true,
        message: "All FreeDelivery And Promoted Product",
        productCount: freeDeliveryIsPromotedProduct1.length,
        product: freeDeliveryIsPromotedProduct1,
      });
      return;
    }

    if (freeDelivery === true && isPromoted === false) {
      res.status(200).json({
        success: true,
        message: "All FreeDelivery",
        productCount: freeDeliveryProduct1.length,
        product: freeDeliveryProduct1,
      });
      return;
    }

    if (isPromoted === true && freeDelivery === false) {
      res.status(200).json({
        success: true,
        message: "All Promoted Product",
        productCount: isPromotedProduct1.length,
        product: isPromotedProduct1,
      });
      return;
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Unable to filtter",
    });
  }
};

exports.productFiltter = async (req, res) => {
  try {
    // const { isFreeDelivery , isPromoted , rating , high } = req.body;
    const { isFreeDelivery, isPromoted, rating, high } = req.body;

    let highvalue = high ? -1 : 1;
    let ratingvalue = rating ? "asc" : "desc";
    let productdata,
      productdata1 = [];

    if (isFreeDelivery == true && isPromoted == false) {
      productdata = await Product.find({
        isFreeDelivery: true,
        isPromoted: false,
      })
        .sort({ Price: highvalue, "bussinessOwner_id.Rating": ratingvalue })
        .populate("bussinessOwner_id");

      let status = 0;

      for (let i = 0; i < productdata.length; i++) {
        status = 0;

        for (let j = 0; j < productdata1.length; j++) {
          console.log(productdata[i].bussinessOwner_id, "find");
          if (productdata1[j]._id == productdata[i].bussinessOwner_id._id) {
            status = 1;
          }
        }

        if (status == 0) {
          productdata1.push(productdata[i].bussinessOwner_id);
        }
      }
    } else if (isFreeDelivery == true && isPromoted == true) {
      productdata = await Product.find({
        isFreeDelivery: true,
        isPromoted: true,
      })
        .sort({ Price: highvalue, "bussinessOwner_id.Rating": ratingvalue })
        .populate("bussinessOwner_id");

      let status = 0;

      for (let i = 0; i < productdata.length; i++) {
        status = 0;

        for (let j = 0; j < productdata1.length; j++) {
          console.log(productdata[i].bussinessOwner_id, "find");
          if (productdata1[j]._id == productdata[i].bussinessOwner_id._id) {
            status = 1;
          }
        }

        if (status == 0) {
          productdata1.push(productdata[i].bussinessOwner_id);
        }
      }
    } else if (isFreeDelivery == false && isPromoted == true) {
      productdata = await Product.find({
        isFreeDelivery: false,
        isPromoted: true,
      })
        .sort({ Price: highvalue, "bussinessOwner_id.Rating": ratingvalue })
        .populate("bussinessOwner_id");

      let status = 0;

      for (let i = 0; i < productdata.length; i++) {
        status = 0;

        for (let j = 0; j < productdata1.length; j++) {
          console.log(productdata[i].bussinessOwner_id, "find");
          if (productdata1[j]._id == productdata[i].bussinessOwner_id._id) {
            status = 1;
          }
        }

        if (status == 0) {
          productdata1.push(productdata[i].bussinessOwner_id);
        }
      }
    }

    if (!productdata) {
      res.status(400).json({
        success: false,
        message: "unable to Filter data",
      });
    }

    if (productdata) {
      res.status(200).json({
        success: true,
        message: "Filter data",
        data: productdata1,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Unable to filtter",
    });
  }
};

// update my product by id
exports.updateProduct = async (req, res) => {
  try {
    const business = await Business.findOne({ user_id: req.user._id });

    if (!business) {
      return res.status(401).json({
        message: "No Business Details Found",
        success: false,
      });
    }

    const {
      name,
      price,
      stockInfo,
      description,
      prepTime,
      isFreeDelivery,
      deliveryRate,
    } = req.body;

    let imageBanner = "";
    if (req.files?.image && req.files?.image[0]) {
      let fileObject = [
        {
          key: req.files.image[0].originalname,
          value: req.files.image[0].buffer,
          filekey: "image",
        },
      ];

      let newupdateobject = await uploadMultipleFiles(fileObject)
        .then((data) => {
          return data;
        })
        .catch((err) => {
          console.log(err);
        });

      imageBanner = newupdateobject[0].Location;
    }

    const findProduct = await Product.findOne({
      _id: req.params.id,
      businessId: business._id,
    });

    if (!findProduct) {
      return res.status(400).json({
        success: false,
        message: "No such product found",
      });
    }

    let updateProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name: name || findProduct.name,
        image: imageBanner || findProduct.image,
        price: price || findProduct.price,
        stockInfo: stockInfo || findProduct.stockInfo,
        description: description || findProduct.description,
        prepTime: prepTime || findProduct.prepTime,
        isFreeDelivery: isFreeDelivery || findProduct.isFreeDelivery,
        deliveryRate: deliveryRate || findProduct.deliveryRate,
      },
      { new: true }
    );

    if (!updateProduct) {
      return res.status(400).json({
        success: false,
        message: "Unable to update product",
      });
    }

    return res.status(200).json({
      success: true,
      data: updateProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      error: "Update Product Is Not Possible",
    });
  }
};

// delete my product by id
exports.deleteProduct = async (req, res) => {
  try {
    const business = await Business.findOne({ user_id: req.user._id });

    if (!business) {
      return res.status(401).json({
        message: "No Business Details Found",
        success: false,
      });
    }

    const findProduct = await Product.findOne({
      _id: req.params.id,
      businessId: business._id,
    });

    if (!findProduct) {
      res.status(400).json({
        success: false,
        error: "No such product found",
      });
      return;
    }

    if (findProduct) {
      await Product.findByIdAndDelete(req.params.id);
      return res.status(400).json({
        message: "Successfully deleted",
        success: true,
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      error: "Something went wrong while deleting the product",
    });
  }
};

// find product according to category
exports.findProductOfCategory = async (req, res) => {
  try {
    const business = await Business.findOne({ user_id: req.user._id });

    if (!business) {
      return res.status(401).json({
        message: "No Business Details Found",
        success: false,
      });
    }
    const { productCategory } = req.body;

    if (!productCategory) {
      return res.status(401).json({
        message: "Missinig paramaeters",
        success: false,
      });
    }

    const findProduct = await Product.find({
      category: productCategory,
      businessId: business._id,
    });

    return res.status(200).json({
      success: true,
      data: findProduct,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      message: "Something went wrong while getting products from category",
      error,
    });
  }
};
