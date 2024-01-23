const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const propertySchema = mongoose.Schema({
    name: {
        type: String,
        required: true, unique:true
    },
    images: [{ type: String }],
    propertyType: {
        type: String,
        required: true,
        enum: ["Amenity", "Stay"]
    },
    chargesType: {
        type: String,
        required: true,
        enum: ["Hourly", "Per-Night"]
    },
    allowedPaymentMethods: [{
        type: String,
        required: true,
        enum: ["preCheckIn", "onCheckIn"]
    }],
    locationInfo: {
        mapsUrl: {
            type: String,
        },
        coordinates: {
            type: {
                type: String,
                default: 'Point',
                required: true
            },
            coordinates: {
                type: [Number],//longitude and latitude
                required: true,
            },
        },
    },
    closedDates: [{
        from: {
            type: Date
        },
        to: {
            type: Date
        }
    }],
    facilities: [{ type: String }],
    configurations: {
        stay: [{
            type: objId,
            ref: "Stay"
        }],
        amenities: [{
            type: objId,
            ref: "Amenity"
        }]
    },
    status:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
});

// Create a 2dsphere index on locationInfo.coordinates field for geospatial queries
propertySchema.index({ 'locationInfo.coordinates': '2dsphere' });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;