const { ObjectId } = require('mongodb');
const Amenity = require("../models/amenity");
const checkImages = require("../helpers/checkImages");
const validator = require("validator");
const validateActiveTiming = require("../helpers/validateTimes")
const saveImages = require("../helpers/saveFilesLocally");
const Property = require("../models/property");
const AmenityBooking = require("../models/amenityBooking");
const generateTimeSlots = require('../helpers/generateTimeslot');
const Booking = require("../models/booking")

const checkAmenityName = async (name) => {
    const amenityExists = await Amenity.findOne({ name: name });
    if (amenityExists) {
        return { success: false, message: `The amenity ${name} already exists.` }
    } else {
        return { success: true, message: "Amenity Name is Unique" }
    };
};


const preAmenityAddChecks = async (body, files) => {
    const checks = await checkAmenityFields(body);
    if (!checks.success) {
        return checks;
    } else {
        const imageChecks = await checkImages(files);
        if (!imageChecks.success) {
            return imageChecks;
        } else {
            return { success: true, message: "All data and files are validated" };
        };
    };
};


const checkAmenityFields = async (body) => {
    const { name, type, description, chargesType, price, maximumAllowedNumber, activeTiming } = body;
    if (await validator.isEmpty(name)) {
        return { success: false, message: "Please enter amenity name", action: null };
    };
    const isUniqueName = checkAmenityName(name);
    if (!((await isUniqueName).success)) {
        return isUniqueName;
    };
    if (validator.isEmpty(type)) {
        return { success: false, message: "Please enter amenity type", action: null };
    };
    if (validator.isEmpty(description)) {
        return { success: false, message: "Please enter amenity description", action: null };
    };
    if (!(chargesType == "Hourly" || chargesType == "Per-Night")) {
        return { success: false, message: "Enter valid charges type", action: null };
    };
    if (!(Number(maximumAllowedNumber))) {
        return { success: false, message: "Only numbers allowed in maximum allowed number", action: null };
    }
    if (!(Number(price.adult) && Number(price.children))) {
        return { success: false, message: "Enter valid prices", action: null };
    };
    if (!validateActiveTiming(activeTiming)) {
        return { success: false, message: "Enter valid Active Timings", action: null };
    };
    return { success: true, message: "All amenity fields are validated", action: null };
};


const addNewAmenity = async (body, images, user, property_id) => {
    try {
        const property = await Property.findById(property_id);
        if (property) {
            if (validator.isMongoId(property_id)) {
                const isPresent = await user.userProperties.includes(new ObjectId(property_id));
                if (isPresent) {
                    const user_id = new ObjectId(user._id).toString();
                    const newAmenity = await new Amenity(body);
                    const propertyId = new ObjectId(property_id).toString();
                    const newAmenityId = new ObjectId(newAmenity._id).toString();
                    const savedImages = await saveImages(images, user_id, propertyId, newAmenityId);
                    newAmenity.images = savedImages.data;
                    const savedAmenity = await newAmenity.save();
                    await property.configurations.amenities.push(newAmenity._id);
                    await property.save();
                    return { success: true, message: "New amenity added to property", data: savedAmenity }
                } else {

                    return { success: false, message: "You can't make changes in the selected property." };
                }
            } else {
                return { success: false, message: "Select a valid property." }
            }
        } else {
            return { success: false, message: "Selected property Doesnt exist." }
        };
    } catch (error) {
        console.log(error.message);
        return { success: false, message: "Unable to add new amenity please try again." }
    };
};

const getByPropId = async (property_id) => {
    try {
        const property = await Property.findById(property_id).select("configurations.amenities").populate("configurations.amenities");
        if (property) {
            return {
                success: true,
                message: "Got amenities of the property.",
                data: property.configurations.amenities
            };
        } else {
            return {
                success: false,
                message: "No amenities found for the property"
            }
        }
    } catch (error) {
        return { success: false, message: "Unable to get amenity for the selected property." }
    };
};

const existAndNotClosed = async (amenity_id, date) => {
    try {
        const amenity = await Amenity.findById(amenity_id);
        if (amenity) {
            if (await amenity.closedDates.includes(date)) {
                return { success: false, message: "Amenity is closed on the selected Date" }
            } else {
                return { success: true, message: "The Amenity for booking exists", data: amenity }
            }
        } else {
            return { success: false, message: "Unable to find the Amenity to book." }
        }
    } catch (error) {
        // console.log(error)
        return { success: false, message: "Got Error while Checking amenity" }
    }
}

const checkBookingDateExists = async (date, amenity_id) => {
    try {
        // Assuming AmenityBooking is a mongoose model
        const bookingExists = await AmenityBooking.findOne({ amenity_id: amenity_id, date: date });
        if (bookingExists) {
            return { success: true, data: bookingExists };
        } else {
            return { success: false };
        }
    } catch (error) {
        return false;
    }
};

const createAmenityDateSlots = async (date, amenity_id, activeTiming) => {
    try {
        const timeSlots = generateTimeSlots(activeTiming);
        const newAmenityBooking = await AmenityBooking.create({ amenity_id: amenity_id, date: date, timeSlots: timeSlots, bookedUsers: [] })
        return { success: true, message: "Created new booking timeslots for selected date.", data: newAmenityBooking }
    } catch (error) {
        return { success: false, message: "Got error while creating new timeslots for selected date" }
    }
}
const bookingRange = async (amenityBooking, timeSlot, amenity, user,date) => {
    const maxNo = amenity.maximumAllowedNumber;
    const { from, to } = timeSlot.value;
    let previousBookings = await Booking.findById(user.previousBookings)

    const bookingNumbers = Number(timeSlot.bookingNumbers.children + timeSlot.bookingNumbers.adult);
    const toPush = {
        user: user._id,
        timeSlot: {
            value: [],
            numbers: {
                adult: timeSlot.bookingNumbers.adult,
                children: timeSlot.bookingNumbers.children
            }
        }
    }

    let success = true;
    let message = "Added bookings to save.";

    amenityBooking.timeSlots.map((currentSlot) => {
        const currentTime = new Date(`2000-01-01 ${currentSlot.time}`);
        const startTime = new Date(`2000-01-01 ${from}`);
        const endTime = new Date(`2000-01-01 ${to}`);

        if (currentTime >= startTime && currentTime < endTime) {
            if (maxNo < currentSlot.bookedNumber + bookingNumbers) {
                success = false;
                message = `Only ${maxNo - (currentSlot.bookedNumber)} slots are available for booking at ${currentSlot.time}.`;
            } else {
                toPush.timeSlot.value.push(currentSlot.time)
                currentSlot.bookedNumber += bookingNumbers;
            }
        }
        return false;
    });
    const totalAdultPrice = await amenity.price.adult * await timeSlot.bookingNumbers.adult * toPush.timeSlot.value.length
    const totalChildrenPrice = await amenity.price.children *await timeSlot.bookingNumbers.children * toPush.timeSlot.value.length
    const toPushBooking = {
        amenity_id: amenity._id,
        timeSlot: {
            value: timeSlot.value,
            date:date
        },
        pricing: {
            adult: {
                number: await (toPush.timeSlot.numbers.adult),
                pricePerAdult: await (amenity.price.adult),
                totalAdultPrice: totalAdultPrice
            },
            children: {
                number: toPush.timeSlot.numbers.children,
                pricePerChildren: amenity.price.children,
                totalChildrenPrice: totalChildrenPrice
            }
        },
        totalPrice: totalAdultPrice+totalChildrenPrice
    }
    await previousBookings.amenitiesBooking.push(toPushBooking)
    await amenityBooking.bookedUsers.push(toPush);
    amenityBooking = await amenityBooking.save();
    previousBookings = await previousBookings.save();
    return { success, message, data: success ? previousBookings : null };
};

const createAmenityBooking = async (amenity, amenityBooking, timeSlot, user,date) => {
    try {
        const bookedAmenity = await bookingRange(amenityBooking, timeSlot, amenity, user, date);
        if (bookedAmenity.success) {
            return {success:true, message:"Booking Created Successfully", data:bookedAmenity.data};
        } else {
            return {success:false, message:"Got into error while creating Booking."};
        }
    } catch (error) {
        console.log(error)
        return {success:false, message:"Got into error while creating Booking."};
    }
}
const checkValidSlots = async (amenity, timeSlot) => {
    try {
        const { from, to } = timeSlot.value;
        const startTime = new Date(`2000-01-01 ${from}`);
        const endTime = new Date(`2000-01-01 ${to}`);
        let activeFrom = amenity.activeTiming.from;
        let activeTo = amenity.activeTiming.to;
        activeFrom = new Date(`2000-01-01 ${activeFrom}`);
        activeTo = new Date(`2000-01-01 ${activeTo}`);
        if (startTime < activeTo && startTime >= activeFrom && endTime > activeFrom && endTime <= activeTo) {
            return { success: true, message: "Slots are valid to book" }
        } else {
            return { success: false, message: "Invalid Slots selected for booking." }
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into error while verifying slots." }
    }
}

module.exports = { preAmenityAddChecks, addNewAmenity, getByPropId, existAndNotClosed, checkBookingDateExists, createAmenityDateSlots, createAmenityBooking, checkValidSlots };