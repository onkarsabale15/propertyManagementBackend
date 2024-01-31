const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const stayValidationSchema = Joi.object({
  title: Joi.string().required(),

  images: Joi.array().items(Joi.string()),

  price: Joi.object({
    adult: Joi.number().required(),
    children: Joi.number().required()
  }).required(),

  maxPeople: Joi.number().required(),

  desc: Joi.string().required(),

  rooms: Joi.array().items(Joi.object({
    bedType: Joi.string().valid('King', 'Queen', 'Master', 'none'),
    occupants: Joi.number().required()
  })),

  roomNumbers: Joi.array().items(Joi.number()),

  closedDates: Joi.array().items(Joi.string()),

  status: Joi.boolean(),

  owner: Joi.objectId().required()
}).required();

module.exports = {
    stayValidationSchema
}