const bcrypt = require("bcrypt");

const checkPassword = async(inputPassword, hashedPassword)=>{
    const isRight = await bcrypt.compare(inputPassword,hashedPassword);
    if(isRight){
        return true;
    }else{
        return false;
    };
};
module.exports = checkPassword;