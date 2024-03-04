const multer = require('multer');

const upload = multer({ dest: 'uploads/' }); // Specify destination folder for uploaded files

const formParser = (req, res, next) => {
  upload.any()(req, res, (err) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    next();
  });
};

module.exports = formParser;