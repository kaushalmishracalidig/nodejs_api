const { express } = require("../../app");
const {
  loginUser,
  registerUser,
  logoutUser,
  verifyToken,
} = require("../../controller/common/authentication");
const { isAuthenticated } = require("../../middleware/Auth");
const {
  saveVerificationBusinessData,
  getVerificationData,
} = require("../../controller/business/businessController");
const multer = require("multer");
const router = express.Router();
const storage = multer.memoryStorage();
var upload = multer({ storage: storage });

router.get("/verify", isAuthenticated, verifyToken);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/verification", isAuthenticated, getVerificationData);
router.post(
  "/verificationRequest",
  upload.fields([
    {
      name: "restaurantImage",
    },
  ]),
  isAuthenticated,
  saveVerificationBusinessData
);
router.get("/logout", isAuthenticated, logoutUser);

module.exports = router;
