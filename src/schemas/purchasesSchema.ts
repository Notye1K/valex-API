import joi from 'joi';

const purchasesSchema = joi.object({
    cardId: joi.number().greater(0).integer().required(),
    password: joi.string().trim().required(),
    businessId: joi.number().greater(0).integer().required(),
    amount: joi.number().greater(0).required()
})

export {
   purchasesSchema
}
