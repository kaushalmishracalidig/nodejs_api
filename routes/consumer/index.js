const { express } = require("../../app");
const router = express.Router();

router.use("/auth", require("./consumerRouter"));
router.use("/store", require("./rastaurant"));

module.exports = router;
