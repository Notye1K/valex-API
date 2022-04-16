import bcrypt from 'bcrypt'

import * as businessRepository from '../repositories/businessRepository.js'
import * as paymentRepository from '../repositories/paymentRepository.js'
import { validateCardId, getBalance } from './validateService.js'
import { validateDate } from '../utils/validateUtils.js'
import { Card } from '../repositories/cardRepository.js'

export async function postPurchase(body: any){
    const cardResult = await validateCardId(body.cardId)

    validateDate(cardResult.expirationDate)

    validatePassword(cardResult.password, body.password)

    await validateBusiness(body.businessId, cardResult)
    
    await validateFunds(body)

    await paymentRepository.insert(body)
}


async function validateBusiness(businessId: number, cardResult: Card) {
    const business = await businessRepository.findById(businessId)
    if (!business || (business.type !== cardResult.type)) {
        throw {
            type: 'user', message: 'this card cannot be used at this establishment', status: 401
        }
    }
}

async function validateFunds(body: any) {
    const { balance } = await getBalance(body.cardId)
    if (balance < body.amount) {
        throw { type: 'user', message: 'Insufficient funds', status: 401 }
    }
}

function validatePassword(cardPassword: string, password: string){
    const isCorrectpassword = bcrypt.compareSync(password, cardPassword);
    if (!isCorrectpassword) {
        throw { type: 'user', message: 'incorrect password', status: 401 };
    }
}
