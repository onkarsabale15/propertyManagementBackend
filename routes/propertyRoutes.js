const express = require("express");
const router = express.Router();
const { addProperty, getPropertyById, getAllProperties } = require("../controllers/propertyControllers");
const authenticateUser = require("../middlewares/authenticateUser");
const formParser = require("../middlewares/formParser");
router.post("/api/addProperty", authenticateUser, formParser, addProperty);
router.get("/api/property/:property_id", getPropertyById)
router.get("/api/properties/all", getAllProperties)
module.exports = router;