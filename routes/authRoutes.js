const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter')
const signupController = require("../controllers/signupController");
const loginController = require("../controllers/loginControllers");
const authenticateUser = require("../middlewares/authenticateUser");
const { handleGetUserData } = require("../controllers/userControllers");
router.post('/api/signUp', limitRate(10), signupController)

router.post('/api/login', limitRate(100), loginController)

router.get("/api/user", authenticateUser, handleGetUserData)
module.exports = router;