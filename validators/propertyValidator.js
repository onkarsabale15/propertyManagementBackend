const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const propertyValidator = Joi.object({
    propertyType: Joi.string().valid('Amenity', 'Hotel', 'Villa', "Stay").required(),
    name: Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    locationInfo: Joi.object({
        address: Joi.string().required(),
        city: Joi.string().required(),
        landmarks: Joi.array().items(Joi.string()),
        googleMapsLink: Joi.string()
    }).required(),
    closedDates: Joi.array().items(Joi.object({
        from: Joi.date(),
        to: Joi.date()
    })),
    facilities: Joi.array().items(Joi.string()),
    configurations: Joi.object({
        stay: Joi.array().items(Joi.objectId()),
        amenities: Joi.array().items(Joi.objectId())
    }),
    status: Joi.boolean().default(false),
    owner: Joi.objectId(),
    _id:Joi.objectId(),
    createdAt: Joi.date(),
    updatedAt: Joi.date(),
    __v:Joi.number()
});

module.exports = {
    propertyValidator
};