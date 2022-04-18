import * as businessRepository from '../repositories/businessRepository.js'
import * as paymentRepository from '../repositories/paymentRepository.js'
import * as cardRepository from '../repositories/cardRepository.js'
import { validateCardId, getBalance } from './validateService.js'
import {
    validateBlock,
    validateCVV,
    validateDate,
    validateIsVirtual,
    validatePassword,
} from '../utils/validateUtils.js'
import { Card } from '../repositories/cardRepository.js'

export async function postPurchase(body: any) {
    const cardResult = await validateCardId(body.cardId)

    validatePassword(cardResult.password, body.password)

    validateIsVirtual(cardResult.isVirtual)

    await validatePurchase(cardResult, body)

    await paymentRepository.insert(body)
}

export async function postOnlinePurchase(body: any) {
    let cardResult = await validateCard(body)

    validateCVV(body.cvv, cardResult.securityCode)

    if (cardResult.isVirtual) {
        cardResult = await validateCardId(cardResult.originalCardId)
    }

    await validatePurchase(cardResult, body)

    await onlinePayment(cardResult.id, body)
}


async function onlinePayment(cardId: number, body: any) {
    const paymentObject = {
        cardId,
        businessId: body.businessId,
        amount: body.amount,
    }
    await paymentRepository.insert(paymentObject)
}

async function validatePurchase(cardResult: cardRepository.Card, body: any) {
    validateDate(cardResult.expirationDate)

    validateBlock(cardResult.isBlocked)

    await validateBusiness(body.businessId, cardResult)

    await validateFunds(cardResult.id, body.amount)
}

async function validateCard(body: any) {
    const cardResult = await cardRepository.findByCardDetails(
        body.number,
        body.name.toUpperCase(),
        body.expirationDate
    )
    if (!cardResult) {
        throw { type: 'user', message: 'card not found', status: 404 }
    }
    return cardResult
}

async function validateBusiness(businessId: number, cardResult: Card) {
    const business = await businessRepository.findById(businessId)
    if (!business || business.type !== cardResult.type) {
        throw {
            type: 'user',
            message: 'this card cannot be used at this establishment',
            status: 401,
        }
    }
}

async function validateFunds(cardId: number, amount: number) {
    const { balance } = await getBalance(cardId)
    if (balance < amount) {
        throw { type: 'user', message: 'Insufficient funds', status: 401 }
    }
}
