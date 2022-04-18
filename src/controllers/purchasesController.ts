import { Request, Response } from "express";

import * as purchasesService from '../services/purchasesService.js'

export async function postPurchase(req: Request, res: Response){
    await purchasesService.postPurchase(req.body)

    res.sendStatus(200)
}

export async function postOnlinePurchase(req: Request, res: Response){
    await purchasesService.postOnlinePurchase(req.body)

    res.sendStatus(200)
}
