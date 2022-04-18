import { Router } from 'express'

import cardsRouter from './cardsRouter.js'
import purchasesRouter from './purchasesRouter.js'

const router = Router()

router.use(cardsRouter)
router.use(purchasesRouter)

export default router
