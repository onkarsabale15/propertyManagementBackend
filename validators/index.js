const {amenityValidationSchema} = require("./amenityValidator")
const checkImage = require("../helpers/checkImages")
const { stayValidationSchema } = require("./stayValidator")
const validators = {
    amenityValidationSchema,
    imageValidation:checkImage,
    stayValidationSchema
}
module.exports = validators;