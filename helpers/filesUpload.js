const fs = require('fs');
const multer = require('multer');

const filesUpload = async (user_id) => {
    const destinationFolder = `files/${user_id}/`;

    // Ensure the destination folder exists, create it if not
    if (!fs.existsSync(destinationFolder)) {
        fs.mkdirSync(destinationFolder, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, destinationFolder);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + "-" + file.originalname);
        },
    });

    const upload = multer({ storage: storage });
    return upload;
};

module.exports = filesUpload;