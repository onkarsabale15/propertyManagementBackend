const Property = require("../models/property");

async function searchByCoordinates(longitude, latitude) {
    try {
        // Specify the coordinates for the aggregation pipeline
        const coordinates = [longitude, latitude];

        // Perform the aggregation using $geoNear without maxDistance
        const closestProperties = await Property.find({
            'locationInfo.coordinates': {
                $nearSphere: {
                    $geometry: {
                        type: 'Point',
                        coordinates: [longitude, latitude],
                    }
                },
            },
        });
        if (closestProperties) {
            return { success: true, message: "Properties found", data: closestProperties };
        } else {
            return { success: false, message: "No properties found within the search radius" };
        }
    } catch (error) {
        console.log(error);
        return {
            success: false,
            message: "Error searching properties",
        };
    }
}

module.exports = { searchByCoordinates };