import joi from 'joi'

const createCardSchema = joi.object({
    employeeId: joi.number().greater(0).integer().required(),
    type: joi
        .string()
        .valid('groceries', 'restaurant', 'transport', 'education', 'health')
        .required(),
})

const cardActivateSchema = joi.object({
    cvv: joi.string().trim().required(),
    password: joi.string().trim().required(),
})

const cardRecharge = joi.object({
    amount: joi.number().greater(0).required(),
})

const cardBlock = joi.object({
    password: joi.string().trim().required(),
})

export { createCardSchema, cardActivateSchema, cardRecharge, cardBlock }
