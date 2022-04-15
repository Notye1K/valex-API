import joi from 'joi';

const createCardSchema = joi.object({
    employeeId: joi.number().greater(0).integer().required(),
    type: joi.string().valid('groceries', 'restaurants', 'transport', 'education', 'health').required()
})

export default createCardSchema
