const express = require("express");
const router = express.Router();
const { addProperty, getPropertyById, getAllProperties, getUserProperties, getPropertyByStay, updateProperty } = require("../controllers/propertyControllers");
const authenticateUser = require("../middlewares/authenticateUser");
const formParser = require("../middlewares/formParser");
router.post("/api/addProperty", authenticateUser, formParser, addProperty);
router.get("/api/property/:property_id", getPropertyById)
router.get("/api/properties/all", getAllProperties);
router.get("/api/userProperties", authenticateUser, getUserProperties);
router.get("/api/propertyByStay/:stay_id",getPropertyByStay);
router.patch("/api/property", authenticateUser, formParser, updateProperty);
module.exports = router;