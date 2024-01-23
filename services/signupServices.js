const validator = require("validator");
const validatePassword = require("../helpers/validatePassword");
const User = require("../models/user");
const hashPassword = require("../helpers/hashPassword");
const Booking = require("../models/booking");
const checkEmailExists = require("../helpers/checkEmailExists");
const checkPhoneExists = require("../helpers/checkPhoneExists");

const checkInputs = async (body) => {
    let { userName, email, phone, password } = body;
    email = String(email).toLowerCase()

    if (!validator.isAlpha(String(userName.firstName))) {
        return { success: false, message: "Invalid first Name", action: null };
    }

    if (!validator.isAlpha(String(userName.lastName))) {
        return { success: false, message: "Invalid last Name", action: null };
    }

    if (!validator.isEmail(String(email))) {
        return { success: false, message: "Invalid Email", action: null };
    }

    if (!validator.isMobilePhone(String(phone.primaryNumber))) {
        return { success: false, message: "Invalid Phone Number", action: null };
    }

    try {
        validatePassword(password);
    } catch (error) {
        return { success: false, message: error.message, action: null };
    }

    return { success: true, message: "All fields validated", action: null };
};

const createUser = async (body) => {
    try {
        const { userName, email, phone, password } = body;
        const hashedPassword = await hashPassword(password);

        let createdUser = await new User({
            userName,
            email,
            phone,
            password: hashedPassword,
            userProperties:[]
        });
        const book = await Booking.create({
            ofUser: createdUser._id,
            amenitiesBooking: [],
            roomBooking: []
        });
        createdUser.previousBookings = book._id;
        createdUser = await createdUser.save();
        return {
            success: true,
            message: "User created successfully",
            action: "/login"
        };
    } catch (error) {
        console.error("Error creating user:", error);
        return {
            success: false,
            message: "Error creating user",
            action: null
        };
    }
};

const preSignupCheck = async (email, phone) => {
    if (await checkEmailExists(email)) {
        return "Email";
    };
    if (await checkPhoneExists(phone.primaryNumber)) {
        return "Phone";
    };
    return false;
}


module.exports = { checkInputs, createUser, preSignupCheck };