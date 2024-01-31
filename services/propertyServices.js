const Property = require("../models/property")
const validator = require("validator");
const areAllImagesValid = require("../validators/checkImages");
const saveFilesLocally = require("../helpers/saveFilesLocally");
const User = require("../models/user");

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
    let { name, propertyType, chargesType, allowedPaymentMethods, locationInfo } = body;
    if (await validator.isEmpty(name)) {
        return { success: false, message: "Please enter property name", action: null };
    };
    const isUniqueName = checkPropertyName(name);
    if (!((await isUniqueName).success)) {
        return isUniqueName;
    };
    if (!(propertyType == "Amenity" || propertyType == "Stay")) {
        return { success: false, message: "Enter valid property type", action: null };
    };
    if (!(chargesType == "Hourly" || chargesType == "Per-Night")) {
        return { success: false, message: "Enter valid charges type", action: null };
    };
    if (!(isValidPaymentMethods(allowedPaymentMethods))) {
        return { success: false, message: "Enter valid payment methods", action: null };
    };
    if (!(validator.isLatLong(`${locationInfo.coordinates.coordinates[0]},${locationInfo.coordinates.coordinates[1]}`))) {
        return { success: false, message: "Invalid Location Data", action: null };
    };
    return { success: true, message: "All Checks of property data before saving are done.", action: null };
}
const addNewProperty = async (newProp, user_id, images) => {
    try {
        newProp.images = await images.data
        const findUser = await User.findById(user_id);
        await findUser.userProperties.push(newProp._id);
        findUser.save();
        const newProperty = await newProp.save();
        return { success: true, message: "New property added Successfully.", data: newProperty, status: 201 };
    } catch (error) {
        console.log(error.message);
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

const getById = async(property_id)=>{
    try{
    const property = await Property.findById(property_id).populate("configurations.stay configurations.amenities");
    if(property){
      return {success: true, data: property};
    }else{
      return {success: false, message: "Property not found"};
    }
  }catch(error){
    console.log(error)
    return {status: false, message:"Got into error while getting property."};
  }
};

const allProperties = async(page)=>{
    try{
    const properties = await Property.find({status: true}).populate("configurations.stay configurations.amenities").skip(page).limit(5);
    return {success: true, data: properties};
  }catch(error){
    console.log(error);
    return {success: false, message: "Error fetching properties"};
  }
}

module.exports = { preAddChecks, addNewProperty, processAndSaveImages, newProperty, getById, allProperties };