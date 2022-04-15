import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt'

import * as companyRepository from '../repositories/companyRepository.js'
import * as employeeRepository from '../repositories/employeeRepository.js'
import * as cardRepository from '../repositories/cardRepository.js'

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


function createCVV(){
    const cvv = faker.finance.creditCardCVV()
    return bcrypt.hashSync(cvv, 8)
}

function newCardConfig(card: any) {
    card.isVirtual = false
    card.isBlocked = false
}

function formatDate(){
    const data = new Date();

    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear()+5

    return mes + '/' + ano.toString().slice(-2);
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
