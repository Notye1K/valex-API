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

export async function activateCard(id: number, body: any) {

    validatePassword(body.password);

    await validateCard(id, body.cvv);

    const password = bcrypt.hashSync(body.password, 8)

    await cardRepository.update(id, {password})

}


async function validateCard(id: number, cvv: string) {
    const cardResult = await validateCardId(id);

    validateCVV(cvv, cardResult.securityCode);

    validateDate(cardResult.expirationDate)

    validateActivation(cardResult.password);
}

function validateDate(expirationDate: string){
    const date = formatDate()
    const year = date.slice(-2)
    const month = date.slice(0,2)

    const expirationYear = expirationDate.slice(-2)
    const expirationMonth = expirationDate.slice(0, 2)

    if (year > expirationYear || (year === expirationYear && month > expirationMonth)){
        throw { type: 'user', message: 'card has expired', status: 406 };
    }
}

function validateActivation(password: string) {
    if (password) {
        throw { type: 'user', message: 'card already active', status: 409 };
    }
}

function validateCVV(cvv: string, securityCode: string) {
    const isCorrectCVV = bcrypt.compareSync(cvv, securityCode);
    if (!isCorrectCVV) {
        throw { type: 'user', message: 'incorrect cvv', status: 401 };
    }
}

async function validateCardId(id: number) {
    const cardResult = await cardRepository.findById(id);
    if (!cardResult) {
        throw { type: 'user', message: 'card not found', status: 404 };
    }
    return cardResult;
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

function formatDate(){
    const date = new Date();

    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear()+5

    return month + '/' + year.toString().slice(-2);
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
