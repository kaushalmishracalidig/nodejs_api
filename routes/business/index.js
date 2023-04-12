const { express } = require("../../app");
const bodyParser = require("body-parser");
const router = express.Router();

router.use("/auth", require("./businessRouter"));
router.use("/category", require("./category"));
router.use("/product", require("./product"));

module.exports = router;
