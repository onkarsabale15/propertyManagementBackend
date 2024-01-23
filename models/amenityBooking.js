const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;
const amenityBookingSchema = mongoose.Schema({
    amenity_id: {
        type: objId,
        ref: "Amenity"
    },
    date: {
        type: String,
        required: true
    },
    timeSlots: [{
        time: {
            type: String,
            required: true
        },
        bookedNumber: {
            type: Number,
            required: true
        }
    }],
    bookedUsers: [{
        user: {
            type: objId,
            required: true,
            ref: "User"
        },
        timeSlot: {
            value: [{
                type: String,//it will have any one value from above timeSlots.time
                required: true
            }],
            numbers: {
                adult: {
                    type: Number,
                    required: true,
                },
                children: {
                    type: Number,
                    required: true,
                }
            }
        }
    }]
});

const AmenityBooking = mongoose.model("AmenityBooking", amenityBookingSchema);
module.exports = AmenityBooking;