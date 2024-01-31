const fs = require("fs");
const sizeOf = require('image-size');

const checkImages = async (images) => {
    const invalidImages = [];
    if (!images || images.length == 0) {
        return {
            success: false,
            message: `Images are required.`,
        };
    };
    const allImagesValid = images.every((image) => {
        if (image && image.filepath) {
            try {
                const dimensions = sizeOf(image.filepath);
                if (dimensions.width && dimensions.height) {
                    return true;
                } else {
                    invalidImages.push({
                        filepath: image.filepath,
                        filename: image.filename || "Unknown",
                        originalFilename: image.originalFilename || "Unknown"
                    });
                    return false;
                }
            } catch (error) {
                invalidImages.push(
                    image.originalFilename || "Unknown"
                );
                return false;
            };
        };
        return false;
    });

    if (allImagesValid) {
        return {
            success: true,
            message: "All Images are valid"
        };
    } else {
        const invalidImageNames = invalidImages.map(image => image).join(', ');
        // console.log(`${invalidImageNames} is not valid Image`);
        return {
            success: false,
            message: `${invalidImageNames} are not valid Images`,
        };
    };
};

module.exports = checkImages;