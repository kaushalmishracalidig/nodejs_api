const { express } = require("../../app");
const {
  addCategory,
  getCategory,
  deleteCategory,
  updateCategory,
} = require("../../controller/business/categoryController");
const {
  findProductOfCategory,
} = require("../../controller/business/productController");
const { isAuthenticated } = require("../../middleware/Auth");
const multer = require("multer");
const router = express.Router();

const storage = multer.memoryStorage();

const uploadService = multer({
  storage: storage,
});

//  business routes
router.get("/", isAuthenticated, getCategory);
router.post("/productCategory", isAuthenticated, findProductOfCategory);
router.post(
  "/",
  isAuthenticated,
  uploadService.fields([
    {
      name: "icon",
    },
  ]),
  addCategory
);
router.delete("/:id", isAuthenticated, deleteCategory);
router.put(
  "/:id",
  isAuthenticated,
  uploadService.fields([
    {
      name: "icon",
    },
  ]),
  updateCategory
);

module.exports = router;
