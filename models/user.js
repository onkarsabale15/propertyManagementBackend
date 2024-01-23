const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const userSchema = mongoose.Schema({
    userName: {
        firstName: {
            type: String,
            required: true
        },
        lastName: {
            type: String,
            required: true
        }
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        primaryNumber: {
            type: Number,
            required: true,
            unique: true
        },
        secondaryNumber: {
            type: Number,
            unique: false
        }
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: "user",
        enum: ['user', 'employee', 'admin'],
    },
    previousBookings: {
        type: objId,
        unique: true,
        ref: "Booking"
    },
    lastLocation: {
        type: {
            type: String,
            enum:["Point"]
        },
        coordinates: {
            type: [Number],
        },
    },
    userProperties:[{
        type:objId,
        ref:"Property"
    }]
}, {
    timestamps: true,
});

// Create a 2dsphere index on lastLocation field for geospatial queries
userSchema.index({ lastLocation: '2dsphere' });

const User = mongoose.model('User', userSchema);
module.exports = User;