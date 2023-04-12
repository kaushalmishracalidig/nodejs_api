const { express } = require("../../app");
const {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
} = require("../../controller/common/authentication");
const { isAuthenticated } = require("../../middleware/Auth");
const router = express.Router();

router.get("/verify", isAuthenticated, verifyToken);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", isAuthenticated, logoutUser);

module.exports = router;
