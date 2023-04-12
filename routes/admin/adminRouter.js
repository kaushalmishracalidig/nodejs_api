const { express } = require("../../app");
const {
  loginUser,
  registerUser,
  allUser,
  deleteUser,
  getUserVerification,
  deleteUserVerification,
} = require("../../controller/common/authentication");
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/users", allUser);
router.delete("/users/:id", deleteUser);
router.get("/verification/:id", getUserVerification);
router.delete("/verification/:id", deleteUserVerification);
// router.put("/users/:id", editUser);
// router.put("/verification/:id", editUserVerification);

module.exports = router;
