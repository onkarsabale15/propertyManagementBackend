const express = require("express");
const router = express.Router();
const limitRate = require('../middlewares/rateLimiter');
const authenticateUser = require("../middlewares/authenticateUser");
const { addStay, getStaysByProp, bookStay, updateStay, getByCheckInCheckOut, getById, getStayBooking, getAllStays, checkAvailability, getStayBookingDates } = require("../controllers/stayControllers");
const formParser = require("../middlewares/formParser");

router.post("/api/addStay", limitRate(5), authenticateUser, formParser, addStay);

router.get("/api/:property_id/stays", getStaysByProp);

router.post("/api/book/stay/:stayId", authenticateUser, bookStay);

router.get("/api/stay/booking", authenticateUser, getStayBooking)

router.patch("/api/stay", authenticateUser, formParser, updateStay)
router.post("/api/stay", getByCheckInCheckOut)
router.get("/api/stay/:stay_id", getById)
router.get("/api/allStays", getAllStays);
router.get('/api/availability/stay/:id', checkAvailability)
router.get("/api/stay/bookingDates/:id", getStayBookingDates)
module.exports = router;