import { Request, Response } from "express";

import * as cardsService from '../services/cardsService.js'

export async function createCard(req: Request, res: Response){
    const apiKey = req.headers['x-api-key']?.toString()
    validateAPIkey(apiKey)

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

export async function recharge(req: Request, res: Response) {
    const apiKey = req.headers['x-api-key']?.toString()
    validateAPIkey(apiKey)

    const id = parseInt(req.params.cardId)
    validateId(id);

    await cardsService.recharge(id, req.body.amount, apiKey)

    res.sendStatus(200)
}


function validateId(id: number) {
    if (id < 1 || isNaN(id)) {
        throw { type: 'user', message: 'invalid id', status: 422 };
    }
}

function validateAPIkey(apiKey: string) {
    if (!apiKey) {
        throw { type: 'user', message: 'missing API key', status: 401 };
    }
}
