import { Request, Response } from "express";

import * as cardsService from '../services/cardsService.js'

export async function createCard(req: Request, res: Response){
    const apiKey = req.headers['x-api-key'].toString()

    await cardsService.createCard(apiKey, req.body)

    res.sendStatus(201)
}

export async function activateCard(req: Request, res: Response) {
    const id = parseInt(req.params.cardId)
    validateId(id);

    await cardsService.activateCard(id, req.body)

    res.sendStatus(200)
}

export async function getInfos(req: Request, res: Response) {
    const id = parseInt(req.params.cardId)
    validateId(id);

    const infos = await cardsService.getInfos(id)

    res.send(infos)
}


function validateId(id: number) {
    if (id < 1 || isNaN(id)) {
        throw { type: 'user', message: 'invalid id', status: 422 };
    }
}
