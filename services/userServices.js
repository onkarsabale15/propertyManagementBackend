const User = require("../models/user")
const getUserData = async(userId)=>{
    try {
        const user = await User.findById(userId).populate({
            path: 'previousBookings',
            populate: {
                path: 'stayBooking',
                populate: {
                    path: 'room.id'
                }
            }
        })
        return {success:true, message:"Got User Data", data:user}
    } catch (error) {
        console.log(error)
        return {success:false,message:"Got into error while getting user data."}
    }
}
module.exports = {getUserData}