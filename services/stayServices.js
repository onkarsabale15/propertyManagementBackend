const validator = require("validator");
const checkImages = require("../validators/checkImages");
const Property = require("../models/property");
const Stay = require("../models/stay");
const saveImages = require("../helpers/saveFilesLocally");
const { ObjectId } = require('mongodb');
const mongoose = require("mongoose");
const fs = require("fs");
const StayBooking = require("../models/stayBooking");
const Booking = require("../models/booking");
const { addCalendarEvent, convertDateToG_CalFormat } = require("./calendarServices");
const validators = require("../validators/index");
const path = require("path")
async function validateRoomNo(roomNo) {
    for (const i of roomNo) {
        if (!Number(i)) {
            return false;
        };
    };
    return true;
};








async function validateRooms(rooms) {
    // Check if 'rooms' is an array
    if (!Array.isArray(rooms)) {
        return false;
    };
    // Validate each room in the array
    for (const room of rooms) {
        // Check if each room is an object
        if (!room || typeof room !== 'object') {
            return false;
        };
        // Validate 'bedType' field
        if (typeof room.bedType !== 'string') {
            return false;
        };

        // Validate 'occupants' field
        if (
            !room.occupants ||
            typeof room.occupants !== 'number'
        ) {
            return false;
        };
    }
    // All rooms in the array are valid
    return true;
}



const preAddChecks = async (body, images, property_id) => {
    try {
        if(!property_id){
            return{
                success: false,
                message: "Please Select Valid Property.",
            }
        }
        const { title } = body;
        const uniqueTitle = await Stay.findOne({ title: title });
        const isValid = validators.stayValidationSchema.validate(body);
        if (isValid.error) {
            return { success: false, message: isValid.error.details[0].message }
        } else {
            if (uniqueTitle) {
                return {
                    success: false,
                    message: `${title} already exists`
                };
            }
        }
        const checkedImages = await checkImages(images);
        if (!checkedImages.success) {
            return checkedImages;
        };
        return {
            success: true,
            message: "All Fields and images are validated"
        };
    } catch (error) {
        return {
            success: false,
            message: "Ran Into an Error While Validating the Fields"
        };
    };
};

const checkPropAndAddStay = async (body, property_id, images, user) => {
    if (validator.isMongoId(property_id)) {
        const isPresent = await user.userProperties.includes(new ObjectId(property_id));
        if (isPresent) {
            body.owner = await user._id;
            user_id = new ObjectId(user._id).toString();
            property_id = new ObjectId(property_id).toString();
            try {
                const newStay = new Stay(body);
                const property = await Property.findById(property_id);
                if (property) {
                    await property.configurations.stay.push(newStay._id);
                    const savedImages = await saveImages(images, user_id);
                    if (savedImages.success) {
                        newStay.images = savedImages.data;
                        newStay.city = (property.locationInfo.city)?property.locationInfo.city:null;
                        const stay = await newStay.save();
                        if (stay) {
                            const prop = await property.save();
                            if (prop) {
                                return {
                                    success: true,
                                    message: "Successfully added new Stay to your property.",
                                    data: stay
                                };
                            } else {
                                return {
                                    success: false,
                                    message: "Got into error while adding stay to the property"
                                }
                            }
                        } else {
                            return {
                                success: false,
                                message: "Got into error while saving Stay"
                            }
                        }
                    } else {
                        return {
                            success: false,
                            message: savedImages.message
                        };
                    };
                } else {
                    return {
                        success: false,
                        message: "Unable to find property to add Stay in."
                    };
                };
            } catch (error) {
                console.log(error);
                return {
                    success: false,
                    message: "Got Into Error While Creating new Stay."
                };
            };
        } else {
            return {
                success: false,
                message: "You dont have access to make changes in this property."
            }
        }
    } else {
        return {
            success: false,
            message: "Cant Find Valid Property to add Stay."
        }
    };
};


const getByPropId = async (property_id) => {
    try {
        const property = await Property.findById(property_id).select("configurations.stay").populate("configurations.stay");
        if (property) {
            return {
                success: true,
                message: "Got stays of the property.",
                data: property.configurations.stay
            };
        } else {
            return {
                success: false,
                message: "No stays found for the property"
            }
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Unable to get stay for the selected property." }
    };
};

function generateDateArray(checkIn, checkOut) {
    const dateArray = [];
    const currentDate = new Date(checkIn);
    const endDate = new Date(checkOut);

    while (currentDate <= endDate) {
        const formattedDate = currentDate.toLocaleDateString('en-CA').replace(/-/g, '/');
        dateArray.push(formattedDate);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateArray;
}

const isClosed = async (stay, dateArray) => {

    try {
        const closedDates = stay.closedDates;
        for (const date of dateArray) {
            if (closedDates.includes(date)) {
                return { success: false, message: `This stay is closed on ${date}` }
            }
        }
        return { success: true, message: `This stay is available on the selected dates.` }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into error while checking room availability" }
    }
}

const createRecord = async (stay_id, date) => {
    try {
        const record = await StayBooking.create({
            stay_id: stay_id, date: date, roomBooked: []
        });
        if (record) {
            return { success: true, message: ` created booking record of date ${date}`, data: record }
        } else {
            return { success: false, message: `Unable to create booking record of date ${date}` }
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "got into error while creating booking record" }
    }
}

const bookingRecords = async (stay_id, dateArray, roomNo) => {
    try {
        let success = true;
        let message = `Successfully created booking records`
        for (const date of dateArray) {
            const recordExist = await StayBooking.findOne({ stay_id: stay_id, date: date });
            if (!recordExist) {
                const createdRecord = await createRecord(stay_id, date);
                if (!createdRecord.success) {
                    return createdRecord;//if no success then will stop execution of for of loop and return to main function
                }
            } else {
                recordExist.roomBooked.map((booking) => {
                    if (booking.value == roomNo) {
                        success = false;
                        message = `Room ${roomNo} is not available for booking on ${date}.`
                    }
                })
            }
        }
        return { success, message }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Got into error while checking booking Records." }
    }
}

const isClosedOrUnavailable = async (roomNo, duration, stay) => {
    const dateArray = await generateDateArray(duration.checkIn, duration.checkOut);
    await dateArray.pop();
    const closed = await isClosed(stay, dateArray);
    if (closed.success) {
        const record = await bookingRecords(stay._id, dateArray, roomNo)
        return record
    } else {
        return closed;
    }
}


const preBookChecks = async (body) => {
    try {
        const stay = await Stay.findById(body.room.id);
        if (stay.roomNumbers.includes(body.roomNo)) {
            if (stay) {
                const isAvailable = await isClosedOrUnavailable(body.roomNo, body.duration, stay)
                if (isAvailable.success) {
                    const totalOccupants = body.room.booking.adult + body.room.booking.children
                    if (totalOccupants > stay.maxPeople) {
                        return { success: false, message: `Only ${stay.maxPeople} people are allowed in this stay.` };
                    } else {
                        return { success: true, message: `All pre book checks completed.` };
                    }
                } else {
                    return { success: false, message: isAvailable.message };
                }
            } else {
                return { success: false, message: "Selected stay doesnt exists" };
            }
        } else {
            return { success: false, message: "Invalid Room Number to book" };
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Got into error while validating booking data." }
    }
}

const finalBooking = async (body, user) => {
    try {
        const dateArray = await generateDateArray(body.duration.checkIn, body.duration.checkOut);
        dateArray.pop();

        const stay = await Stay.findById(body.room.id);

        // Update stay bookings in parallel
        await Promise.all(dateArray.map(async (date) => {
            const stayBooking = await StayBooking.findOne({ stay_id: stay._id, date: date });
            stayBooking.roomBooked.push({ value: body.roomNo, ofUser: user._id });
            await stayBooking.save();
        }));

        // Calculate charges
        const totalAdultPrice = stay.price.adult * body.room.booking.adult * dateArray.length;
        const totalChildrenPrice = stay.price.children * body.room.booking.children * dateArray.length;
        const totalCharges = totalAdultPrice + totalChildrenPrice;

        // Update user bookings
        const booking = await Booking.findById(user.previousBookings);
        const toPush = {
            room: {
                id: body.room.id,
                charges: {
                    adult: {
                        number: body.room.booking.adult,
                        pricePerAdult: stay.price.adult,
                        totalAdultPrice: totalAdultPrice
                    },
                    children: {
                        number: body.room.booking.children,
                        pricePerChildren: stay.price.children,
                        totalChildrenPrice: totalChildrenPrice
                    },
                    totalCharges: totalCharges
                }
            },
            roomNo: body.roomNo,
            duration: {
                checkIn: body.duration.checkIn,
                checkOut: body.duration.checkOut,
                totalDuration: dateArray.length
            }
        };

        booking.stayBooking.push(toPush);
        const booked = await booking.save();

        if (booked) {
            const event = {
                summary: `Booking For Room : ${toPush.roomNo}`,
                description: `${stay.desc}`,
                start: {
                    dateTime: convertDateToG_CalFormat(body.duration.checkIn),
                    timeZone: 'Asia/Kolkata'
                },
                end: {
                    dateTime: convertDateToG_CalFormat(body.duration.checkOut),
                    timeZone: 'Asia/Kolkata'
                }
                // ,
                // 'attendees': [
                //   { 'email': 'onkarsabale15@gmail.com' },
                // ]
            };
            const eventAdded = await addCalendarEvent(event);
            if (eventAdded) {
                return { success: true, message: "Successfully booked the stay.", data: booked };
            } else {
                return { success: true, message: "Got into error while creating calendar event", data: booked };
            }
        } else {
            return { success: false, message: "Got into an error while saving booking in the user profile." };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "Got into an error while creating the booking." };
    }
};
const canUpdateStay = async (stay_id, user_id) => {
    if (ObjectId.isValid(stay_id)) {
        let stay = await Stay.findById(stay_id);
        if (stay.owner.equals(user_id)) {
            return { success: true, message: "Stay can be updated", data: stay }
        }
        else {
            return { success: false, message: "You are not authorized to update this stay.", status: 401 }
        }
    } else {
        return { success: false, message: "Invalid stay id", status: 400 }
    }

}
const preUpdateChecks = async (body, images, user) => {
    try {
        const canUpdate = await canUpdateStay(body._id, user._id);
        if (canUpdate.success) {
            const isValid = validators.stayValidationSchema.validate(body);
            if (isValid.error) {
                return { success: false, message: isValid.error.details[0].message, status: 400 }
            } else {
                if (images?.length > 0) {
                    const validImages = await checkImages(images)
                    if (validImages.success) {
                        return { success: true, message: "All Data and Images are Valid", data: canUpdate.data, status: 200 }
                    } else {
                        return { success: false, message: validImages.message, status: 400 }
                    }
                } else {
                    return { success: true, message: "All Fields are valid", data: canUpdate.data, status: 200 }
                }
            }
        } else {
            return canUpdate;
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while validating the data.", status: 500 }
    }
}

const updatingStay = async (body, images, user, stay) => {
    try {
        if (images) {
            const savedImages = await saveImages(await images, await user._id.toString());
            if (savedImages.success) {
                body.images.push(...savedImages.data)
            } else {
                return { success: false, message: savedImages.message }
            }
        }
        if (stay.images != body.images) {
            const unusedImages = stay.images.filter(image => !body.images.includes(image));

            // Remove unused images from the filesystem
            for (const image of unusedImages) {
                fs.unlink(path.join(__dirname, `../uploads${image}`), (err) => {
                    if (err) {
                        console.error(`Error deleting file: ${err}`);
                        return { success: false, message: `Error deleting unwanted files` };
                    }
                });
            }
            // Update stay.images to only include images present in both arrays
            stay.images = stay.images.filter(image => body.images.includes(image));
        }
        if (stay.title != body.title) {
            stay.title = body.title
        }
        if (stay.images != body.images) {
            stay.images = body.images
        }
        if (stay.price != body.price) {
            stay.price = body.price
        }
        if (stay.maxPeople != body.maxPeople) {
            stay.maxPeople = body.maxPeople
        }
        if (stay.desc != body.desc) {
            stay.desc = body.desc
        }
        if (stay.rooms != body.rooms) {
            stay.rooms = body.rooms
        }
        if (stay.roomNumbers != body.roomNumbers) {
            stay.roomNumbers = body.roomNumbers
        }
        if (stay.closedDates != body.closedDates) {
            stay.closedDates = body.closedDates
        }
        if (stay.status != body.status) {
            stay.status = body.status
        }
        if(stay.facilities != body.facilities){
            stay.facilities = body.facilities;
        }
        const saved = await stay.save();
        if (saved) {
            return { success: true, message: "Successfully updated the stay.", data: saved, status: 200 }
        } else {
            return { success: false, message: "Got into an error while updating the stay.", status: 500 }
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Got into an error while updating the stay.", status: 500 }
    }
}

async function findAvailableStays(checkIn, checkOut) {
    const dateArray = generateDateArray(checkIn, checkOut);

    try {
        // Find stays with bookings within the specified date range
        const staysWithBookings = await StayBooking.find({
            date: { $in: dateArray }
        })

        // Find stays that do not have bookings or closed dates during the specified date range
        const availableStays = await Stay.find({
            _id: { $nin: staysWithBookings },
            closedDates: { $not: { $elemMatch: { $in: dateArray } } }
        }).populate('owner', 'username');

        // Filter stays with available rooms
        const result = availableStays.map(stay => {
            // Filter available rooms for the stay
            const availableRooms = stay.roomNumbers.filter(roomNumber => {
                // Check if the room is available for each date in the date range
                return dateArray.every(date => {
                    return !staysWithBookings.some(booking => {
                        return booking.stay_id.equals(stay._id) && booking.date === date && booking.roomBooked.some(room => room.value === roomNumber);
                    });
                });
            });

            // If at least one room is available, include the stay in the result
            if (availableRooms.length > 0) {
                // return {success: true, message: "Found available stays", data: result, status: 200};
                return { stay, availableRooms };
            }

            return null;
        }).filter(Boolean);
        if(result.length > 0){
            return { success: true, message: `Found ${result.length} available stays`, data: result, status: 200};;
        }else{
            return { success: false, message: "No available stays found", status: 400 };
        }
    } catch (error) {
        console.error(error);
        return { success: false, message: "Got into an error while finding available stays.", status: 500 };
    }
}


const getStaysByCheckinCheckout = async (checkIn, checkOut) => {
    try {
        const stayExists = await findAvailableStays(checkIn, checkOut);
        return stayExists;
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while finding available stays by checkin and checkout dates.", status: 500 }
    }
}

const getStayById = async (id) => {
    try {
        const stay = await Stay.findById(id);
        if (stay) {
            return { success: true, message: "Successfully found the stay.", data: stay, status: 200 }
        } else {
            return { success: false, message: "Could not find the stay.", status: 404 }
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Got into an error while finding the stay.", status: 500 }
    }
}

const isAdmin = async (user) => {
    try {
        if (user.role == 'admin') {
            return { success: true, message: "Successfully validated the user.", data: user, status: 200 }
        } else {
            return { success: false, message: "You are not authorized to perform this action.", status: 401 }
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while validating the user.", status: 500 }
    }
}

const getAllStayBookings = async (user) => {
    try {
        const admin = await isAdmin(user);
        if (admin.success) {
            const bookingsAggregate = await Booking.aggregate([
                // Unwind the stayBooking array
                { $unwind: "$stayBooking" },
                // Sort by duration.checkIn
                { $sort: { 'stayBooking.duration.checkIn': 1 } },
                // Group back into an array
                {
                    $group: {
                        _id: null,
                        stayBooking: { $push: "$stayBooking" }
                    }
                }
            ]);

            // Extract stayBooking array from the result
            const stayBookings = bookingsAggregate.length > 0 ? bookingsAggregate[0].stayBooking : [];

            // Populate stayBooking.room.id
            const populatedStayBookings = await Booking.populate(stayBookings, { path: "room.id", model: "Stay" });
            if (populatedStayBookings) {
                return { success: true, message: "Successfully found the bookings.", data: populatedStayBookings, status: 200 }
            } else {
                return { success: false, message: "Could not find the bookings.", status: 404 }
            }
        } else {
            return admin;
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while finding the stay.", status: 500 }
    }
}

const allStays = async()=>{
    try{
    const stays = await Stay.find();
    if(stays){
      return {success: true, message: "Successfully found all stays", data: stays}
    }else{
      return {success: false, message: "Could not find any stays", status: 404}
    }
  }catch(error){
    console.log(error);
    return {success: false, message: "Got into an error while finding stays", status: 500}
  }
}

async function generateDateArrayAsync(checkIn, checkOut) {
    return new Promise((resolve, reject) => {
        try {
            const dateArray = [];
            const currentDate = new Date(checkIn);
            const endDate = new Date(checkOut);

            while (currentDate <= endDate) {
                const formattedDate = currentDate.toLocaleDateString('en-CA').replace(/-/g, '/');
                dateArray.push(formattedDate);
                currentDate.setDate(currentDate.getDate() + 1);
            }

            resolve(dateArray);
        } catch (error) {
            reject(error);
        }
    });
}


const availabilityChecks = async(id, checkIn, checkOut)=>{
    try {
        const regex = /^\d{4}\/\d{2}\/\d{2}$/;
        const idValid = validator.isMongoId(id.toString());
        if(!idValid){
            return { success: false, message: "Invalid stay id.", status: 400 }
        }
        const checkinValid = regex.test(checkIn);
        const checkoutValid = regex.test(checkOut);
        if(!checkinValid ||!checkoutValid){
            return { success: false, message: "Invalid checkin or checkout date.", status: 400 }
        }
        return { success: true, message: "Successfully validated the id and dates.", status: 200 }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while checking availability data.", status: 500 }
    }
}

const isAvailable = async(id, checkIn, checkOut)=>{
    try {
        const checks = await availabilityChecks(id, checkIn, checkOut);
        if(checks.success){
            const dateArray = await generateDateArrayAsync(checkIn, checkOut);
            const books = await StayBooking.find({
                stay_id: id,
                date: { $in: dateArray }
            });
            if(!books){
                return { success: false, message: "Stay is not available.", status: 400 }
            }else{
                return { success: true, message: "Stay is available.", status: 200 }
            }
        }else{
            return checks;
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while checking availability.", status: 500 }
    }
}

const getBookingDates = async(id)=>{
    try {
        const bookingDates = await StayBooking.find({
            stay_id: id,
        }).select('date');
        if(bookingDates){
            return {success: true, message: "Successfully found booking dates", data: bookingDates}
        }else{
            return {success: false, message: "Could not find any booking dates", status: 404}
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Got into an error while finding booking dates.", status: 500 }
    }
}

module.exports = { preAddChecks, checkPropAndAddStay, getByPropId, preBookChecks, finalBooking, preUpdateChecks, updatingStay, getStaysByCheckinCheckout, getStayById, getAllStayBookings,allStays, isAvailable, getBookingDates };