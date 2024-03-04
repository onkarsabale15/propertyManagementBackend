const fs = require("fs");
const sizeOf = require('image-size');
const validator = require("validator");

const checkImages = async (images) => {
    const invalidImages = [];
    if (!images || images.length == 0) {
        return {
            success: false,
            message: `Images are required.`,
        };
    };
    const allImagesValid = images.every((image) => {
        if (image && image.path) {
            try {
                const dimensions = sizeOf(image.path);
                if (dimensions.width && dimensions.height) {
                    return true;
                } else {
                    invalidImages.push({
                        filepath: image.path,
                        filename: image.filename || "Unknown",
                        originalFilename: image.originalname || "Unknown"
                    });
                    return false;
                }
            } catch (error) {
                invalidImages.push(
                    image.originalname || "Unknown"
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