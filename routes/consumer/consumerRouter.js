const { express } = require("../../app");
const {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
} = require("../../controller/common/authentication");
const {
  saveLocation,
  getLocation,
} = require("../../controller/consumer/locationController");

const { isAuthenticated } = require("../../middleware/Auth");
const router = express.Router();

router.get("/verify", isAuthenticated, verifyToken);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/location", isAuthenticated, saveLocation);
router.get("/location", isAuthenticated, getLocation);
router.get("/logout", isAuthenticated, logoutUser);

module.exports = router;
