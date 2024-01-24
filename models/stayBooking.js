const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;
const stayBookingSchema = mongoose.Schema({
    stay_id: {
        type: objId,
        ref: "Stay"
    },
    date: {
        type: String,
        required: true
    },
    roomBooked: [{
        value: {
            type:Number,
        },
        ofUser: {
            type: objId,
            ref: "User"
        }
    }],

});
const StayBooking = mongoose.model('StayBooking', stayBookingSchema);
module.exports = StayBooking;