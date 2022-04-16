import { Router } from "express";

import * as cardsController from "../controllers/cardsController.js"
import validateSchema from "../middlewares/validateSchemaMiddleware.js";
import * as cardsSchema from "../schemas/cardsSchema.js";

const cardsRouter = Router();

cardsRouter.post('/cards', validateSchema(cardsSchema.createCardSchema), cardsController.createCard)
cardsRouter.put('/cards/:cardId/activate', validateSchema(cardsSchema.cardActivateSchema), cardsController.activateCard)
cardsRouter.get('/cards/:cardId', cardsController.getInfos)

export default cardsRouter
