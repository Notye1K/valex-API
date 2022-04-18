import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt'

import * as companyRepository from '../repositories/companyRepository.js'
import * as employeeRepository from '../repositories/employeeRepository.js'
import * as cardRepository from '../repositories/cardRepository.js'
import * as rechargeRepository from '../repositories/rechargeRepository.js'
import { validateCardId, getBalance } from './validateService.js'
import { validateDate, formatDate, validateBlock, validatePassword as checkPassword, validateCVV, validateIsVirtual } from '../utils/validateUtils.js'

export async function createCard(apiKey: string, body: any) {

    await validateApiKey(apiKey)

    const fullName = await validateEmployeeId(body.employeeId)

    await validateMoreThanOneCard(body)

    const card = {...body}

    card.number = await createCardNumber()
    
    card.cardholderName = formatName(fullName)

    card.expirationDate = formatDate()

    card.securityCode = createCVV()

    newCardConfig(card)

    cardRepository.insert(card)
}

export async function activateCard(id: number, body: any) {

    validatePassword(body.password);

    await validateCard(id, body.cvv);

    const password = bcrypt.hashSync(body.password, 8)

    await cardRepository.update(id, {password})

}

export async function getInfos(id: number) {

    await validateCardId(id)

    const { balance, transactions, recharges } = await getBalance(id);

    return {
        balance,
        transactions,
        recharges
    }
}

export async function recharge(id: number, amount: number, apiKey: string) {
    await validateApiKey(apiKey)

    const cardResult = await validateCardId(id)
    validateDate(cardResult.expirationDate)

    validateIsVirtual(cardResult.isVirtual)    

    await rechargeRepository.insert({cardId: id, amount})
}

export async function block(id: number, password: string){
    const cardResult = await validateCardId(id)

    blockUnblockValidation(cardResult, password);
    
    validateBlock(cardResult.isBlocked)

    await cardRepository.update(id, {isBlocked: true})
}

export async function unblock(id: number, password: string){
    const cardResult = await validateCardId(id)

    blockUnblockValidation(cardResult, password);
    
    validateUnblock(cardResult.isBlocked)

    await cardRepository.update(id, { isBlocked: false })
}

export async function createVirtual(id: number, password: string){
    const cardResult = await validateCardId(id)

    checkPassword(cardResult.password, password);

    validateIsVirtual(cardResult.isVirtual);

    const card = await createObjForVirtual(cardResult)

    cardRepository.insert(card)
}

export async function deleteVirtual(id: number, password: string) {
    const cardResult = await validateCardId(id)

    checkPassword(cardResult.password, password);

    validateIsVirtualForDelete(cardResult.isVirtual);

    await cardRepository.remove(id)
}


function validateIsVirtualForDelete (isVirtual: boolean){
    if(!isVirtual) {
        throw {
            type: 'user', message: 'you can only delete virtual cards', status: 406
        };
    }
}

async function createObjForVirtual(cardResult: cardRepository.Card){
    const card = {...cardResult}
    card.number = await createCardNumber()
    card.expirationDate = formatDate()
    card.isBlocked = false
    card.isVirtual = true
    card.originalCardId = cardResult.id
    delete card.id
    card.securityCode = createCVV()

    return card
}


function validateUnblock(isBlocked: boolean) {
    if (!isBlocked) {
        throw { type: 'user', message: 'card already unblocked', status: 406 };
    }
}

function blockUnblockValidation(cardResult: cardRepository.Card, password: string) {
    validateDate(cardResult.expirationDate);

    checkPassword(cardResult.password, password);
}

async function validateCard(id: number, cvv: string) {
    const cardResult = await validateCardId(id);

    validateCVV(cvv, cardResult.securityCode);

    validateDate(cardResult.expirationDate)

    validateActivation(cardResult.password);
}

function validateActivation(password: string) {
    if (password) {
        throw { type: 'user', message: 'card already active', status: 409 };
    }
}

function validatePassword(password: string) {
    const regex = /^[0-9]{4}$/;
    if (!regex.test(password)) {
        throw { type: 'user', message: 'the password must be a four-digit number', status: 406 };
    }
}

function createCVV(){
    const cvv = faker.finance.creditCardCVV()
    console.log(cvv);
    return bcrypt.hashSync(cvv, 8)
}

function newCardConfig(card: any) {
    card.isVirtual = false
    card.isBlocked = false
}

function formatName(fullName: string) {
    const arr = fullName.split(' ')

    if (arr.length>2) {
        let cardName = arr[0]

        for (let i = 1; i < arr.length-1; i++) {
            const element = arr[i];

            if (element.length>=3) {
                cardName += ' '+element[0]
            }
        }

        cardName += ' '+arr[arr.length-1]

        return cardName.toUpperCase()
    } else{
        return fullName.toUpperCase()
    }
}

async function createCardNumber() {
    let cardNumber = faker.finance.creditCardNumber('5[1-5]##-####-####-####')
    let result = await validateUniqueCard(cardNumber)
    while (result) {
        cardNumber = faker.finance.creditCardNumber('5[1-5]##-####-####-####')
        result = await validateUniqueCard(cardNumber)
    }
    return cardNumber
}

async function validateUniqueCard(cardNumber: string) {
    const cardNumberResult = await cardRepository.findByNumber(cardNumber)
    if (cardNumberResult) {
        return true
    }
    return false
}

async function validateMoreThanOneCard(body: any) {
    const moreThanOneTypeResult = await cardRepository.findByTypeAndEmployeeId(body.type, body.employeeId)
    if (moreThanOneTypeResult) {
        throw { type: 'user', message: 'this employee already has a card of this type', status: 403 }
    }
}

async function validateEmployeeId(employeeId: number) {
    const employeeResult = await employeeRepository.findById(employeeId)
    if (!employeeResult) {
        throw { type: 'user', message: 'employeeId not found', status: 401 }
    }

    return employeeResult.fullName
}

async function validateApiKey(apiKey: string) {
    const apiKeyResult = await companyRepository.findByApiKey(apiKey)
    if (!apiKeyResult) {
        throw { type: 'user', message: 'invalid api key', status: 401 }
    }
}
