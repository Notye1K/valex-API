import { Router } from "express";

import * as cardsController from "../controllers/cardsController.js"
import validateSchema from "../middlewares/validateSchemaMiddleware.js";
import cardsSchema from "../schemas/cardsSchema.js";

const cardsRouter = Router();

cardsRouter.post('/cards', validateSchema(cardsSchema), cardsController.createCard)

export default cardsRouter
