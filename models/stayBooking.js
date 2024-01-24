const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;
const stayBookingSchema = mongoose.Schema({
    user: {
        type: objId,
        required: true,
        ref: "User"
    },
    property: {
        type: objId,
        ref: "Property"
    },
    room: [{
        id: {
            type: objId,
            ref: "Stay"
        },
        charges: {
            type: Number,
            required: true
        }
    }],
    roomNo: [{
        type: Number,
        required: true
    }],
    duration: {
        checkIn: {
            type: Date,
            required: true
        },
        checkOut: {
            type: Date,
            required: true
        },
        totalDuration:{

        }
    },
    totalCharges: {
        type: Number,
        required: true
    }
});
const StayBooking = mongoose.model('StayBooking', stayBookingSchema);
module.exports = StayBooking;