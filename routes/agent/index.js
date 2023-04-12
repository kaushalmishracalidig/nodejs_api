const { express } = require("../../app");
const router = express.Router();

router.use("/auth", require("./agentRouter"));

module.exports = router;
