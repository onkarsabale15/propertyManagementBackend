const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter');
const authenticateUser = require("../middlewares/authenticateUser");
const formParser = require("../middlewares/formParser");
const {addAmenityController, getAmenityByProperty, bookAmenity, getAmenityById } = require("../controllers/amenityControllers");

router.post("/api/addAmenity", limitRate(5), authenticateUser, formParser, addAmenityController );

router.get("/api/:property_id/amenities", getAmenityByProperty)

router.get("/api/amenity/:amenity_id", getAmenityById)

router.post("/api/book/amenity/:amenityId", authenticateUser, bookAmenity);

module.exports = router;