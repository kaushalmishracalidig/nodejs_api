const { express } = require("../../app");
const {
  allCategory,
  deleteCategory,
  allProduct,
  deleteProduct,
} = require("../../controller/admin/adminController");
const router = express.Router();

router.get("/allCategory/:id", allCategory);
router.delete("/allCategory/:id", deleteCategory);
router.get("/allProduct/:id", allProduct);
router.delete("/allProduct/:id", deleteProduct);

module.exports = router;
