const mongoose = require("mongoose");

const objId = mongoose.Schema.Types.ObjectId;

const bookingSchema = mongoose.Schema({
    ofUser: {
        type: objId,
        ref: "User"
    },
    amenitiesBooking: [{
        amenity_id: {
            type: objId,
            ref: "Amenity"
        },
        timeSlot: {
            value: {
                from: {
                    type: String,//it will have any one value from above timeSlots.time
                    required: true
                },
                to: {
                    type: String,//it will have any one value from above timeSlots.time
                    required: true
                }
            },
            date: {
                type: String,//it will have any one value from above timeSlots.time
                required: true
            }
        },
        pricing: {
            adult: {
                number: {
                    type: Number,
                    required: true,
                },
                pricePerAdult: {
                    type: Number,
                    required: true,
                },
                totalAdultPrice: {
                    type: Number,
                    required: true
                }
            },
            children: {
                number: {
                    type: Number,
                    required: true,
                },
                pricePerChildren: {
                    type: Number,
                    required: true,
                },
                totalChildrenPrice: {
                    type: Number,
                    required: true,
                }
            }
        },
        totalPrice: {
            type: String,
            required: true
        }
    }],
    roomBooking: [{
        type: objId,
        ref: "RoomBooking"
    }]
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking