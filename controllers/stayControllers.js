const { preAddChecks, checkPropAndAddStay, getByPropId, preBookChecks, finalBooking, preUpdateChecks, updatingStay, getStaysByCheckinCheckout, getStayById, getAllStayBookings, allStays, isAvailable, getBookingDates } = require("../services/stayServices");
const formatDate = require("../helpers/dateFormater")
const addStay = async (req, res) => {
    try {
        let body = await JSON.parse(req.body.data);
        const property_id = await body.property_id;
        body = body.fields;
        const images = await req.files;
        const user = await req.user;
        const check = await preAddChecks(body, images, property_id);
        if (check.success) {
            const added = await checkPropAndAddStay(body, property_id, images, user);
            if(added.success){
                res.status(201).json({ type: true, message: added.message, data: added.data })
            } else {
                res.status(400).json({ type: false, message: added.message })
            }
        } else {
            console.log(check)
            res.status(400).json({ type: false, message: check.message });
        };
    } catch (error) {
        console.log(error)
        res.status(500).json({ type: false, message: "Got into an error while adding the stay." })
    }
};

const getStaysByProp = async (req, res) => {
    const { property_id } = req.params;
    const stays = await getByPropId(property_id)
    if (stays.success) {
        res.status(200).json({ type: true, message: stays.message, data: stays.data })
    } else {
        res.status(404).json({ type: false, message: stays.message })
    }
};

const bookStay = async (req, res) => {
    const body = req.body;
    const user = req.user;
    const checks = await preBookChecks(body);
    if (checks.success) {
        const finalBook = await finalBooking(body, user);
        if (finalBook.success) {
            res.status(201).json({ type: true, message: finalBook.message, data: finalBook.data })
        } else {
            res.status(400).json({ type: false, message: finalBook.message })
        }
    } else {
        res.status(400).json({ type: false, message: checks.message })
    }
}

const updateStay = async (req, res) => {
    // console.log(req.body)
    let body = await JSON.parse(req.body.data);
    const images = await req.files;
    const user = await req.user;
    const checks = await preUpdateChecks(body, images, user);
    if (checks.success) {
        const updated = await updatingStay(body, images, user, checks.data);
        if (updated) {
            return res.status(updated.status).json({ type: true, message: updated.message, data: updated.data })
        } else {
            return res.status(updated.status).json({ type: false, message: updated.message })
        }
    } else {
        res.status(checks.status).json({ type: checks.success, message: checks.message })
    }
}

const getByCheckInCheckOut = async (req, res) => {
    try {
        const { checkIn, checkOut } = req.body;
        const stays = await getStaysByCheckinCheckout(checkIn, checkOut);
        res.status(stays.status).json({type:stays.success, message:stays.message, data:stays.data?stays.data:null})
    } catch (error) {
        console.log(error)
        res.status(500).json({ type: false, message: "Got into an error while getting the stays." })
    }
}

const getById = async (req, res) => {
    const { stay_id } = req.params;
    const stay = await getStayById(stay_id);
    if (stay.success) {
        res.status(200).json({ type: true, message: stay.message, data: stay.data })
    } else {
        res.status(404).json({ type: false, message: stay.message })
    }
}

const getStayBooking = async(req, res)=>{
    try {
        const user = req.user;
        const bookings = await getAllStayBookings(user);
        // console.log(bookings)
        if(bookings.success){
            res.status(200).json({ type: true, message: bookings.message, data: bookings.data })
        }else{
            res.status(bookings.status).json({ type: false, message: bookings.message })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ type: false, message: "Something went wrong" })
    }
}

const getAllStays = async(req,res)=>{
    try {
        const stays = await allStays();
        if(stays.success){
            res.status(200).json({ type: true, message: stays.message, data: stays.data })
        }else{
            res.status(stays.status).json({ type: false, message: stays.message })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ type: false, message: "Something went wrong" })
    }
}

const checkAvailability = async (req, res) => {
    try {
        const id = req.params.id;
        const checkIn = req.query.checkIn?.replace(/-/g, "/");
        const checkOut = req.query.checkOut?.replace(/-/g, "/");
        const available = await isAvailable(id, checkIn, checkOut);
        if(available.success){
            res.status(200).json({ type: true, message: available.message, data: available.data })
        }else{
            res.status(available.status).json({ type: false, message: available.message })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ type: false, message: "Something went wrong" })
    }
}

const getStayBookingDates = async (req, res) => {
    try {
        const { id } = req.params;
        const bookingDates = await getBookingDates(id);
        if(bookingDates.success){
            res.status(200).json({ type: true, message: bookingDates.message, data: bookingDates.data })
        }else{
            res.status(bookingDates.status).json({ type: false, message: bookingDates.message })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({ type: false, message: "Got into an error while getting the stay booking dates." })
    }
}

module.exports = { addStay, getStaysByProp, bookStay, updateStay, getByCheckInCheckOut, getById, getStayBooking, getAllStays, checkAvailability, getStayBookingDates };