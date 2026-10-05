// =============================================================================
// SPANDANA — Auth Routes
// =============================================================================

const router = require("express").Router();
const { signup, login, logout, me } = require("../controllers/authController");
const auth = require("../middleware/auth");

router.post("/signup",  signup);
router.post("/login",   login);
router.post("/logout",  logout);   // clears the httpOnly cookie
router.get("/me",       auth, me);

module.exports = router;
