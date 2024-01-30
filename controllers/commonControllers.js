const { searchByCoordinates } = require("../services/commonServices");

const searchByLocation = async(req,res)=>{
    try {
        const { longitude, latitude } = req.query;
        const data = await searchByCoordinates(longitude, latitude);
        console.log(data)
        if(data.success){
            res.status(200).json({type:true, data})
        }else{
            res.status(404).json({type:false, message:"Not Found"})
        }
    } catch (error) {
        console.error(error)
        res.status(500).json({type:false, message:"Internal Server Error"})
    }
}
module.exports = { searchByLocation };