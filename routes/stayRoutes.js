const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter');
const authenticateUser = require("../middlewares/authenticateUser");
const { addStay, getStaysByProp } = require("../controllers/stayControllers");
const formParser = require("../middlewares/formParser");

router.post("/api/addStay", limitRate(5), authenticateUser, formParser, addStay);

router.get("/api/:property_id/stays", getStaysByProp);



module.exports = router;