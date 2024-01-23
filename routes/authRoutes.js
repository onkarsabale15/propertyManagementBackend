const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter')
const signupController = require("../controllers/signupController");
const loginController = require("../controllers/loginControllers");

router.post('/api/signUp', limitRate(10), signupController)

router.post('/api/login', limitRate(100), loginController)

module.exports = router;