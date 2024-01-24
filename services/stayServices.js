const validator = require("validator");
const checkImages = require("../helpers/checkImages");
const Property = require("../models/property");
const Stay = require("../models/stay");
const Amenity = require("../models/amenity");
const saveImages = require("../helpers/saveFilesLocally");
const { ObjectId } = require('mongodb');
const AmenityBooking = require("../models/amenityBooking");
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



const preAddChecks = async (body, images) => {
    try {
        const { title, price, maxPeople, desc, rooms, roomNumbers } = body;
        const uniqueTitle = await Stay.findOne({ title: title });
        if (uniqueTitle) {
            return {
                success: false,
                message: `${title} already exists`
            };
        }
        if (validator.isEmpty(title)) {
            return {
                success: false,
                message: "Title should Not Be Empty."
            };
        };
        if (!(Number(price.adult) && Number(price.children))) {
            return {
                success: false,
                message: "Adult Pricing and Children Pricing are Required."
            };
        };
        if (!Number(maxPeople)) {
            return {
                success: false,
                message: "Enter Valid Number Value for maximum people allowed."
            };
        };
        if (validator.isEmpty(desc)) {
            return {
                success: false,
                message: "Description should not be Epmty."
            };
        };
        if (!(await validateRooms(rooms))) {
            return {
                success: false,
                message: "Please Add Valid Rooms."
            };
        };
        if (!(await validateRoomNo(roomNumbers))) {
            return {
                success: false,
                message: "Enter valid Room Numbers"
            };
        };
        const checkedImages = await checkImages(images);
        if (!checkedImages.success) {
            return checkedImages;
        };
        return {
            success: true,
            message: "All Fields and images are validated"
        };
    } catch (error) {
        console.log(error)
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
                        const stay = await newStay.save();
                        await property.save();
                        return {
                            success: true,
                            message: "Successfully added new Stay to your property.",
                            data: stay
                        };
                    } else {
                        return savedImages;
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
        return { success: false, message: "Unable to get amenity for the selected property." }
    };
};


module.exports = { preAddChecks, checkPropAndAddStay, getByPropId };