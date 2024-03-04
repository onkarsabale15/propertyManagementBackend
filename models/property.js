const mongoose = require("mongoose");
const objId = mongoose.Schema.Types.ObjectId;

const propertySchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    images: [{ type: String }],
    propertyType: {
        type: String,
        required: true,
        enum: ["Amenity", "Hotel", "Villa"]
    },
    locationInfo: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        landmarks: [{
            type: String
        }],
        googleMapsLink: {
            type: String,
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
    status: {
        type: Boolean,
        default: false
    },
    owner: {
        type: objId,
        ref: "User",
        required: true
    }
}, {
    timestamps: true
});

// Create a 2dsphere index on locationInfo.coordinates field for geospatial queries
// propertySchema.index({ 'locationInfo.coordinates': '2dsphere' });

const Property = mongoose.model('Property', propertySchema);
module.exports = Property;