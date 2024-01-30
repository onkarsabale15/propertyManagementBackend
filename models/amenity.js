
const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const amenitySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    images: [{ type: String }],
    description: {
        type: String,
    },
    maximumAllowedNumber: {
        type: Number,
        required: true
    },
    chargesType: {
        type: String,
        required: true,
        enum: ["Hourly", "Per-Night"]
    },
    price: {
        adult: {
            type: Number,
            required: true,
        },
        children: {
            type: Number,
            required: true,
        },
    },
    activeTiming: {
        from: {
            type: String,
            required: true,
        },
        to: {
            type: String,
            required: true,
        },
        slotWidth:{
            type:String,
            required:true
        }
    },
    closedDates: [{
        type:String
    }],
    bookings: [{
        date: {
            type: String
        },
        record: {
            type: objId,
            ref: "AmenityBooking"
        }
    }],
    status:{
        type:Boolean,
        default:false
    }
});
const Amenity = mongoose.model("Amenity", amenitySchema);
module.exports = Amenity;