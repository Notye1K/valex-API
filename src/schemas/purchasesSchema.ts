import joi from 'joi'

const purchasesSchema = joi.object({
    cardId: joi.number().greater(0).integer().required(),
    password: joi.string().trim().required(),
    businessId: joi.number().greater(0).integer().required(),
    amount: joi.number().greater(0).required(),
})

const onlinePurchaseSchema = joi.object({
    number: joi.string().trim().required(),
    name: joi.string().trim().required(),
    expirationDate: joi.string().trim().required(),
    cvv: joi.string().trim().required(),
    businessId: joi.number().greater(0).integer().required(),
    amount: joi.number().greater(0).required(),
})

export { purchasesSchema, onlinePurchaseSchema }
