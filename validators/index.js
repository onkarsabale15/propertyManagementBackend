const {amenityValidationSchema} = require("./amenityValidator")
const checkImage = require("../helpers/checkImages")
const { stayValidationSchema } = require("./stayValidator")
const { propertyValidator } = require("./propertyValidator")
const validators = {
    amenityValidationSchema,
    imageValidation:checkImage,
    stayValidationSchema,
    propertyValidator
}
module.exports = validators;