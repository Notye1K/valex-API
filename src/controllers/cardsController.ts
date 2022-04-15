import { Request, Response } from "express";

import * as cardsService from '../services/cardsService.js'

export async function createCard(req: Request, res: Response){
    const apiKey = req.headers['x-api-key'].toString()

    await cardsService.createCard(apiKey, req.body)

    res.sendStatus(201)
}
