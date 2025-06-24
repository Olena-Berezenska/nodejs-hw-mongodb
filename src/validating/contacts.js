import Joi from 'joi';

export const createContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).required().messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
    'any.required': 'Username is required',
  }),
  phoneNumber: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^\+?[0-9]{10,15}$/)
    .required()
    .message('Phone number must be a valid international format'),
  email: Joi.string().email().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .required()
    .default('personal'),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});

export const updateContactSchema = Joi.object({
  name: Joi.string().min(3).max(20).messages({
    'string.base': 'Username should be a string',
    'string.min': 'Username should have at least {#limit} characters',
    'string.max': 'Username should have at most {#limit} characters',
  }),
  phoneNumber: Joi.string()
    .min(3)
    .max(20)
    .pattern(/^\+?[0-9]{10,15}$/)
    .message('Phone number must be a valid international format'),
  email: Joi.string().email().min(3).max(20),
  isFavourite: Joi.boolean(),
  contactType: Joi.string()
    .valid('work', 'home', 'personal')
    .default('personal'),
  createdAt: Joi.date(),
  updatedAt: Joi.date(),
});
