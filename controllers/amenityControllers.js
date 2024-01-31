const { preAmenityAddChecks, addNewAmenity, getByPropId, existAndNotClosed, checkBookingDateExists, createAmenityDateSlots, createAmenityBooking, checkValidSlots, getAmenityByAmId, preUpdateChecks, updatingAmenity } = require("../services/amenityServices")


const addAmenityController = async (req, res) => {
    let body = await JSON.parse(req.body.data[0]);
    const propertyId = await body.property_id;
    body = await body.fields;
    const images = await req.files.images;
    const user = await req.user;
    const checks = await preAmenityAddChecks(body, images);
    if (!checks.success) {
        res.status(400).json({ type: false, message: checks.message });
    } else {
        const amenity = await addNewAmenity(body, images, user, propertyId);
        if (amenity.success) {
            res.status(201).json({ type: true, message: amenity.message, data: amenity.data })
        } else {
            res.status(422).json({ type: false, message: amenity.message })
        };
    };
};


const getAmenityByProperty = async (req, res) => {
    const { property_id } = req.params;
    const amenities = await getByPropId(property_id);
    if (amenities.success) {
        res.status(200).json({ type: amenities.success, message: amenities.message, data: amenities.data })
    } else {
        res.status(400).json({ type: false, message: amenities.message });
    };
};

const getAmenityById = async(req,res)=>{
    try {
        const { amenity_id } = req.params;
        const amenities = await getAmenityByAmId(amenity_id);
        if (amenities.success) {
            res.status(200).json({ type: amenities.success, message: amenities.message, data: amenities.data })
        } else {
            res.status(400).json({ type: false, message: amenities.message });
        }
    } catch (error) {
        res.status(500).json({ type: false, message: "Internal Server Error" });
    }
}

const bookAmenity = async (req, res) => {
    try {
        let { amenity_id, date, timeSlot } = req.body;
        const user = req.user;
        let notClosed = await existAndNotClosed(amenity_id, date);
        if (notClosed.success) {
            const validSlot = await checkValidSlots(notClosed.data, timeSlot);
            if (validSlot.success) {
                const dateExists = await checkBookingDateExists(date, amenity_id);
                if (!dateExists.success) {
                    const createdSlots = await createAmenityDateSlots(date, amenity_id, notClosed.data.activeTiming);
                    if (createdSlots.success) {
                        await notClosed.data.bookings.push({ date: date, record: createdSlots.data._id })
                        notClosed.data = await notClosed.data.save()
                        const amenityBooking = await createAmenityBooking(notClosed.data, dateExists.data, timeSlot, user, date)
                        console.log(amenityBooking)
                        if(amenityBooking.success){
                            res.status(201).json({type:true, message:amenityBooking.message, data:amenityBooking.data})
                        }else{
                            res.status(400).json({type:false, message:amenityBooking.message})
                        }
                    }
                } else {
                    const amenityBooking = await createAmenityBooking(notClosed.data, dateExists.data, timeSlot, user, date);
                    if (amenityBooking.success) {
                        res.status(201).json({ type: true, message: amenityBooking.message, data: amenityBooking.data })
                    }else{
                        res.status(500).json({type:false, message: amenityBooking.message})
                    }
                }
            } else {
                res.status(400).json({ type: false, message: validSlot.message })
            }
        } else {
            res.status(400).json({ type: false, message: "The selected amenity is closed on selected date." })
        }
    } catch (error) {
        console.log(error)
        res.json({ type: false, message: "Got into error while booking given Amenity" })
    }
};

const updateAmenity = async(req,res)=>{
    let body = await JSON.parse(req.body.data[0]);
    const images = await req.files.images;
    const user = await req.user;
    const checks = await preUpdateChecks(body, images, user);
    if(checks.success){
        const updated = await updatingAmenity(body,images,user);
        if(updated.success){
            res.status(200).json({type: true, message: updated.message, data: updated.data})
        }else{
            res.status(400).json({type: false, message: updated.message})
        }
    }else{
        return{type:false, message:checks.message}
    }
}

module.exports = { addAmenityController, getAmenityByProperty, bookAmenity, getAmenityById, updateAmenity };