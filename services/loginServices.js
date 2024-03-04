const env = require('dotenv');
env.config();
const checkEmailExists = require("../helpers/checkEmailExists");
const validatePassword = require("../helpers/validatePassword");
const User = require("../models/user");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const checkPassword = require("../helpers/checkPassword")

const preLoginChecks = async (email, password) => {
    try {
        if (!validator.isEmail(String(email))) {
            return { success: false, message: "Invalid Email", action: null };
        } else {
            if (await checkEmailExists(email)) {
                const validPassword = await validatePassword(password);
                if (validPassword.success) {
                    return { success: true };
                }
            } else {
                return { success: false, message: "Invalid Email or Password" };
            };
        }
    } catch (error) {
        return { success: false, message: error.message }
    }
};

const checkUserAndLogin = async (email, password) => {
    let userExists = await User.findOne({ email: email });
    if (userExists) {
        if (await checkPassword(password, userExists.password)) {
            userExists.password = undefined;
            if(userExists.role=="user"){
                userExists.role = undefined;
            }
            const token = await jwt.sign({ userExists }, JWT_SECRET_KEY);
            return { success: true, message: "User logged in", data: {token,userExists}, status: 200 };
        } else {
            return { success: false, message: "Invalid email or password", status: 401 };
        };
    } else {
        return { success: false, message: "No user registered with this email.", status: 404 };
    };
};

module.exports = { preLoginChecks, checkUserAndLogin };