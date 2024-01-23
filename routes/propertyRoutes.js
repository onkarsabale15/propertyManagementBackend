const express = require("express");
const router = express.Router();
const { addProperty, bookProperty } = require("../controllers/propertyControllers");
const authenticateUser = require("../middlewares/authenticateUser");
const formParser = require("../middlewares/formParser");
router.post("/api/addProperty", authenticateUser, formParser, addProperty);
router.post("/api/book/property/:propertyId", authenticateUser, bookProperty)
module.exports = router;