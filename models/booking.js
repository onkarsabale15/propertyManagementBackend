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
    stayBooking: [{
        createdOn:{
            type:Date,
            default:Date.now()
        },
        status:[{
            type:String,
            default:"created",
            enum:["created", "paid", "checkedIn", "checkedOut", "cancelled"]
        }],
        room: {
            id: {
                type: objId,
                ref: "Stay"
            },
            charges: {
                adult: {
                    number: {
                        type: Number,
                        required: true
                    },
                    pricePerAdult: {
                        type: Number,
                        required: true
                    },
                    totalAdultPrice: {
                        type: Number,
                        required: true
                    }
                },
                children: {
                    number: {
                        type: Number,
                        required: true
                    },
                    pricePerChildren: {
                        type: Number,
                        required: true
                    },
                    totalChildrenPrice: {
                        type: Number,
                        required: true
                    }
                },
                totalCharges: {
                    type: Number,
                    required: true
                }
            }
        },
        roomNo: {
            type: Number,
            required: true
        },
        duration: {
            checkIn: {
                type: String,
                required: true
            },
            checkOut: {
                type: String,
                required: true
            },
            totalDuration: {
                type: String,
                required: true
            }
        }
    }]
}, {
    timestamps: true
});

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking