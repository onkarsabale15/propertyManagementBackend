const User = require("../models/user");
const checkPhoneExists = async(phone)=>{
    const exists = await User.findOne({"phone.primaryNumber":phone});
    if(exists){
        return true;
    }else{
        return false;
    };
}
module.exports = checkPhoneExists;