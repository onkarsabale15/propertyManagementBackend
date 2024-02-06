const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const stayValidationSchema = Joi.object({
    title: Joi.string().required(),
    images: Joi.array().items(Joi.string()),
    price: Joi.number().required(),
    maxPeople: Joi.number().required(),
    desc: Joi.string().required(),
    rooms: Joi.array().items(Joi.object({
        bedType: Joi.string().valid('King', 'Queen', 'Master', 'none'),
        occupants: Joi.number().required(),
        roomFacilities: Joi.array().items(Joi.string()),
        _id:Joi.objectId()
    })),
    roomNumbers: Joi.array().items(Joi.number()),
    closedDates: Joi.array().items(Joi.string()),
    status: Joi.boolean().default(false),
    owner: Joi.objectId(),
    facilities: Joi.array().items(Joi.string()),
    _id:Joi.objectId(),
    status:Joi.boolean(),
    __v:Joi.number(),
    createdAt:Joi.date(),
    updatedAt:Joi.date()
}).required();

module.exports = {
    stayValidationSchema
};