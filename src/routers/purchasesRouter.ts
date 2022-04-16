import { Router } from "express";

import * as purchasesController from "../controllers/purchasesController.js"
import validateSchema from "../middlewares/validateSchemaMiddleware.js";
import * as purchasesSchema from "../schemas/purchasesSchema.js";

const purchasesRouter = Router();

purchasesRouter.post('/purchases', validateSchema(purchasesSchema.purchasesSchema), purchasesController.postPurchase)

export default purchasesRouter
