const formidable = require('formidable');

const formParser = (req, res, next) => {
    const form = new formidable.IncomingForm({ multiples: true });

    form.parse(req, (err, fields, files) => {
        if (err) {
            console.error('Error:', err);
            res.status(500).send('Internal Server Error');
            return;
        }
        req.body = fields;
        req.files = files;
        next();
    });
};

module.exports = formParser;