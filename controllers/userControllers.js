const { getUserData } = require("../services/userServices");

const handleGetUserData = async(req,res)=>{
    try {
        const user = req.user;
        const userData = await getUserData(user._id)
        if(userData.success){
            res.status(200).json({type:true, data:userData.data})
        }else{
            res.status(500).json({type:false,message:userData.message})
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({type:false,message:"Internal Server Error"})
    }
}
module.exports = {handleGetUserData}