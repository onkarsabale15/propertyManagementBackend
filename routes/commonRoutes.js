const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter');
const {searchByLocation} = require("../controllers/commonControllers");

//To get amenities, stays and properties by longitude and latitude as query params as key value pair
router.get("/api/search", limitRate(5), searchByLocation)



module.exports = router;