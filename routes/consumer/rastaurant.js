const { express } = require("../../app");
const {
  restaurants,
  restaurantsById,
} = require("../../controller/consumer/restaurantController");
const { isAuthenticated } = require("../../middleware/Auth");

const router = express.Router();
router.get("/restaurants", isAuthenticated, restaurants);
router.get("/restaurants/:id", isAuthenticated, restaurantsById);

module.exports = router;
