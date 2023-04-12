const { express } = require("../../app");
const { isAuthenticated } = require("../../middleware/Auth");
const router = express.Router();
const multer = require("multer");
const {
  addProduct,
  getProduct,
  deleteProduct,
  getProductById,
  updateProduct /* updateProductImage */,
} = require("../../controller/business/productController");

const storage = multer.memoryStorage();

const uploadService = multer({
  storage: storage,
});

router.post(
  "/",
  isAuthenticated,
  uploadService.fields([
    {
      name: "image",
    },
  ]),
  addProduct
);
router.get("/", isAuthenticated, getProduct);
router.get("/:id", isAuthenticated, getProductById);
router.put(
  "/:id",
  isAuthenticated,
  uploadService.fields([
    {
      name: "image",
    },
  ]),
  updateProduct
);
// router.put("/image/:id", isAuthenticated, updateProductImage);
router.delete("/:id", isAuthenticated, deleteProduct);

module.exports = router;
