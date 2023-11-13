import * as Joi from 'joi';

export default Joi.object({
  REDIS_PORT: Joi.number().required(),
  REDIS_HOST: Joi.string().required(),
  REDIS_USERNAME: Joi.string().required().allow(''),
  REDIS_PASSWORD: Joi.string().required().allow(''),
});
