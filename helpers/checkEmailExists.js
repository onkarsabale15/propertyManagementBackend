const User = require("../models/user");
const checkEmailExists = async (email) => {
    const user = await User.findOne({ email: email });
    if (user) {
        return true;
    } else {
        return false;
    };
};

module.exports = checkEmailExists;