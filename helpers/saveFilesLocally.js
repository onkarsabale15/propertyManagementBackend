const fs = require('fs');
const path = require('path');
const sizeOf = require('image-size');

const saveFilesLocally = async (images, user_id) => {
    const loc = `../uploads/${user_id}`;
    const uploadDir = path.join(__dirname, loc);

    try {
        // Use recursive option to create parent directories if they don't exist
        fs.mkdirSync(uploadDir, { recursive: true });
    } catch (mkdirError) {
        return { success: false, message: "Unable to create upload directory. Please try again." };
    };

    const savedImageNames = [];

    try {
        images.forEach((image, index) => {
            if (image && image.path) {
                const dimensions = sizeOf(image.path);
                // Check if the dimensions indicate it's an image
                if (dimensions.width > 0 && dimensions.height > 0) {
                    const timestamp = new Date().toISOString().replace(/[-TZ:.]/g, '');
                    const fileName = `image_${timestamp}_${index + 1}.${dimensions.type}`;
                    const filePath = path.join(uploadDir, fileName);

                    // Use try-catch for file operations
                    try {
                        fs.writeFileSync(filePath, fs.readFileSync(image.path));
                        fs.unlinkSync(image.path);
                        savedImageNames.push(`/${user_id}/${fileName}`);
                    } catch (fileError) {
                        throw new Error("Unable to save images. Please try again.");
                    }
                } else {
                    throw new Error("Unable to save images. Please try again.");
                }
            } else {
                throw new Error("Unable to save images. Please try again.");
            }
        });
    } catch (error) {
        return { success: false, message: error.message };
    }

    return { success: true, message: "All images saved successfully.", data: savedImageNames };
};

module.exports = saveFilesLocally;
