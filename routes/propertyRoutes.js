const express = require("express");
const router = express.Router();
const { addProperty } = require("../controllers/propertyControllers");
const authenticateUser = require("../middlewares/authenticateUser");
const formParser = require("../middlewares/formParser");
router.post("/api/addProperty", authenticateUser, formParser, addProperty);
module.exports = router;