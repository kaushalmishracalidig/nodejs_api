const { express } = require("../../app");
const router = express.Router();

router.use("/auth", require("./adminRouter"));
router.use("/dashboard", require("./all_admin_data"));

module.exports = router;
