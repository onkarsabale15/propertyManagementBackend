const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter');
const authenticateUser = require("../middlewares/authenticateUser");
const { addStay, getStaysByProp, bookStay, updateStay, getByCheckInCheckOut, getById, getStayBooking, getAllStays } = require("../controllers/stayControllers");
const formParser = require("../middlewares/formParser");

router.post("/api/addStay", limitRate(5), authenticateUser, formParser, addStay);

router.get("/api/:property_id/stays", getStaysByProp);

router.post("/api/book/stay/:stayId", authenticateUser, bookStay);

router.get("/api/stay/booking", authenticateUser, getStayBooking)

router.patch("/api/stay", authenticateUser, formParser, updateStay)
router.post("/api/stay/:stay_id", authenticateUser, getByCheckInCheckOut)
router.get("/api/stay/:stay_id", getById)
router.get("/api/allStays", getAllStays)
module.exports = router;