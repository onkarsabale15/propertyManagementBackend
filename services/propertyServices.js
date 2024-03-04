const Property = require("../models/property")
const validator = require("validator");
const areAllImagesValid = require("../validators/checkImages");
const saveFilesLocally = require("../helpers/saveFilesLocally");
const User = require("../models/user");
const { propertyValidator } = require("../validators/index")
const checkImages = require("../validators/checkImages")
const Stay = require("../models/stay")
const isValidPaymentMethods = (allowedPaymentMethods) => {
    const validPaymentMethods = ["onCheckIn", "preCheckIn"];

    for (const method of allowedPaymentMethods) {
        if (!validPaymentMethods.includes(method)) {
            return false;
        };
    };
    return true;
};
const checkPropertyName = async (name) => {
    const propertyExists = await Property.findOne({ name: name });
    if (propertyExists) {
        return { success: false, message: `The property ${name} already exists.` }
    } else {
        return { success: true, message: "Property Name is Unique" }
    }
}
const preAddChecks = async (body, files) => {
    try {
        const isValid = await propertyValidator.validate(body);
        if (isValid.error) {
            return { success: false, message: isValid.error.details[0].message };
        }
        else {
            const isUniqueName = checkPropertyName(body.name);
            if (!((await isUniqueName).success)) {
                return isUniqueName;
            } else {
                const isValidimage = await checkImages(files);
                if (isValidimage.success) {
                    return { success: true, message: "All Checks of property data before saving are successful.", action: null };
                }
                else {
                    return isValidimage;
                }
            }
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Internal server error, Unable to add new property, try again." };
    }
}
const addNewProperty = async (newProp, user_id, images) => {
    try {
        newProp.images = await images.data
        const findUser = await User.findById(user_id);
        await findUser.userProperties.push(newProp._id);
        findUser.save();
        newProp.owner = user_id
        const newProperty = await newProp.save();
        return { success: true, message: "New property added Successfully.", data: newProperty, status: 201 };
    } catch (error) {
        return { success: false, message: "Internal server error, Unable to add new property, try again.", status: 500 }
    };
};

const processAndSaveImages = async (images, user_id, property) => {
    const isValidimage = await areAllImagesValid(images)
    if (isValidimage.success) {
        const savedImageNames = await saveFilesLocally(images, user_id, property);
        return savedImageNames
    } else {
        return isValidimage
    };
};
const newProperty = (body) => {
    try {
        const prop = new Property(body);
        return { success: true, message: "new unsaved Property document of MongoDB created.", data: prop };
    } catch (error) {
        console.log(error);
        return { success: false, message: "Got error while creating Property" }
    };
};

const getById = async (property_id) => {
    try {
        const property = await Property.findById(property_id).populate("configurations.stay configurations.amenities");
        if (property) {
            return { success: true, data: property };
        } else {
            return { success: false, message: "Property not found" };
        }
    } catch (error) {
        console.log(error)
        return { status: false, message: "Got into error while getting property." };
    }
};

const allProperties = async (page) => {
    try {
        const properties = await Property.find({ status: true }).populate("configurations.stay configurations.amenities").skip(page).limit(5);
        return { success: true, data: properties };
    } catch (error) {
        console.log(error);
        return { success: false, message: "Error fetching properties" };
    }
}

const usersProperties = async (user_id) => {
    try {
        const user = await User.findById(user_id);
        if (user) {
            const properties = await Property.find({ owner: user_id });
            return { success: true, data: properties };
        } else {
            return { success: false, message: "User not found" };
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Error fetching properties" };
    }
}

const getPropertyFromStay = async (stay_id) => {
    try {
        const stay = await Stay.findById(stay_id);
        if (stay) {
            const property = await Property.findOne({
                "configurations.stay": {
                    $in: [stay_id]
                }
            });
            if (property) {
                return { success: true, data: property };
            } else {
                return { success: false, message: "Property not found for given stay" };
            }
        } else {
            return { success: false, message: "Stay not found" };
        }
    } catch (error) {
        console.log(error);
        return { success: false, message: "Error fetching property from stay" };
    }
}

const canMakeChanges = async (property_id, user) => {
    try {
        if (user.userProperties.includes(property_id)) {
            return { success: true, message: "You can make changes to this property." }
        } else {
            return { success: false, message: "You can't make changes to this property.", status: 403 }
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Internal server error, Unable to complete pre update acccess checks, try again.", status: 500 };
    }
}

const preUpdateChecks = async (body, uploadedImages, user) => {
    try {
        const canUpdate = await canMakeChanges(body._id, user);
        if (canUpdate.success) {
            const isValid = await propertyValidator.validate(body);
            if (isValid.error) {
                return { success: false, message: isValid.error.details[0].message, status: 400 };
            } else {
                if (uploadedImages?.length > 0) {
                    const isValidimage = await checkImages(uploadedImages);
                    if (isValidimage.success) {
                        return { success: true, message: "All Checks of property data before saving are successful.", action: null };
                    }
                    else {
                        return isValidimage;
                    }
                } else {
                    return { success: true, message: "All Checks of property data before saving are successful.", action: null };
                }
            }
        } else {
            return canUpdate;
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Internal server error, Unable to complete pre update checks, try again.", status: 500 };
    }
}

const editProperty = async (body, images, user) => {
    try {
        const property = await Property.findById(body._id);
        if (property) {
            if (images) {
                const savedImages = await saveFilesLocally(await images, await user._id.toString());
                if (savedImages.success) {
                    body.images.push(...savedImages.data)
                } else {
                    return { success: false, message: savedImages.message, status: 400 };
                }
            }
            if (property.images != body.images) {
                const unusedImages = property.images.filter(image => !body.images.includes(image));

                // Remove unused images from the filesystem
                for (const image of unusedImages) {
                    fs.unlink(path.join(__dirname, `../uploads${image}`), (err) => {
                        if (err) {
                            console.error(`Error deleting file: ${err}`);
                            return { success: false, message: `Error deleting unwanted files`, status: 400 };
                        }
                    });
                }
                // Update stay.images to only include images present in both arrays
                property.images = property.images.filter(image => body.images.includes(image));
            }
            const updatedProperty = await Property.findByIdAndUpdate(body._id, { $set: body }, { new: true });
            if (updatedProperty) {
                return { success: true, message: "Property updated successfully", data: updatedProperty };
            } else {
                return { success: false, message: "Unable to make changes in property.", status: 400 };
            }
        } else {
            return { success: false, message: "Property not found", status: 404 };
        }
    } catch (error) {
        console.log(error)
        return { success: false, message: "Internal server error, Unable to complete pre update checks, try again.", status: 500 };
    }
}

module.exports = { preAddChecks, addNewProperty, processAndSaveImages, newProperty, getById, allProperties, usersProperties, getPropertyFromStay, preUpdateChecks, editProperty };