const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const amenityValidationSchema = Joi.object({
    name: Joi.string().required(),

    type: Joi.string().required(),

    images: Joi.array().items(Joi.string()),

    description: Joi.string().required(),
    maximumAllowedNumber: Joi.number().required(),
    chargesType: Joi.string().valid('Hourly', 'Per-Night', 'SlotWise').required(),
    price: Joi.object({
        adult: Joi.number().required(),
        children: Joi.number().required()
    }).required(),
    activeTiming: Joi.object({
        from: Joi.string().required(),
        to: Joi.string().required(),
        slotWidth: Joi.string().required()
    }).required(),
    closedDates: Joi.array().items(Joi.string()),
    bookings: Joi.array().items(Joi.object({
        date: Joi.string(),
        record: Joi.objectId()
    })),
    _id:Joi.objectId(),
    status:Joi.boolean(),
    __v:Joi.number()
}).required();

module.exports = { amenityValidationSchema };