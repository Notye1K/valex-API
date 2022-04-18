import { Router } from "express";

import * as cardsController from "../controllers/cardsController.js"
import validateSchema from "../middlewares/validateSchemaMiddleware.js";
import * as cardsSchema from "../schemas/cardsSchema.js";

const cardsRouter = Router();

cardsRouter.post('/cards', validateSchema(cardsSchema.createCardSchema), cardsController.createCard)
cardsRouter.patch('/cards/:cardId/activate', validateSchema(cardsSchema.cardActivateSchema), cardsController.activateCard)
cardsRouter.post('/cards/:cardId/recharge', validateSchema(cardsSchema.cardRecharge), cardsController.recharge)
cardsRouter.patch('/cards/:cardId/block', validateSchema(cardsSchema.cardBlock), cardsController.block)
cardsRouter.patch('/cards/:cardId/unblock', validateSchema(cardsSchema.cardBlock), cardsController.unblock)
cardsRouter.post('/cards/:cardId/virtual', validateSchema(cardsSchema.cardBlock), cardsController.createVirtual)
cardsRouter.delete('/cards/:cardId/virtual', validateSchema(cardsSchema.cardBlock), cardsController.deleteVirtual)
cardsRouter.get('/cards/:cardId', cardsController.getInfos)

export default cardsRouter
