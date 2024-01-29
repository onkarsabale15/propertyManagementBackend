const {preAddChecks, checkPropAndAddStay, getByPropId, checkBookingDateExists, createAmenityDateSlots, existAndNotClosed, preBookChecks, finalBooking } = require("../services/stayServices");
const formatDate = require("../helpers/dateFormater")
const addStay = async (req, res) => {
    let body = await JSON.parse(req.body.data[0]);
    const property_id = await body.property_id;
    body = await body.fields;
    const images = await req.files.images;
    const user = await req.user;
    const check = await preAddChecks(body, images);
    if(check.success){
        const added = await checkPropAndAddStay(body,property_id, images, user);
        res.status(201).json({type:true, message:added.message, data:added.data});
    }else{
        res.status(400).json({type:false, message:check.message});
    };
};

const getStaysByProp = async(req,res)=>{
    const {property_id}=req.params;
    const stays = await getByPropId(property_id)
    if(stays.success){
        res.status(200).json({type:true,message:stays.message,data:stays.data})
    }else{
        res.status(404).json({type:false, message:stays.message})
    }
};

const bookStay = async(req,res)=>{
    const body = req.body;
    const user = req.user;
    const checks = await preBookChecks(body);
    if(checks.success){
        const finalBook = await finalBooking(body,user);
        if(finalBook.success){
            res.status(201).json({type:true, message:finalBook.message, data:finalBook.data})
        }else{
            res.status(400).json({type:false, message:finalBook.message})
        }
    }else{
        res.status(400).json({type:false,message:checks.message})
    }
}

module.exports = { addStay, getStaysByProp, bookStay};