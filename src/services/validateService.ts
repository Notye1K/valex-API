import * as cardRepository from '../repositories/cardRepository.js'
import * as paymentRepository from '../repositories/paymentRepository.js'
import * as rechargeRepository from '../repositories/rechargeRepository.js'

export async function validateCardId(id: number) {
    const cardResult = await cardRepository.findById(id)
    if (!cardResult) {
        throw { type: 'user', message: 'card not found', status: 404 }
    }
    return cardResult
}

export async function getBalance(id: number) {
    const transactions = await paymentRepository.findByCardId(id)
    const recharges = await rechargeRepository.findByCardId(id)

    if (!recharges) {
        throw { type: 'user', message: 'Insufficient funds', status: 401 }
    }

    const rechargesAmount = recharges.reduce(
        (acc, current) => acc + current.amount,
        0
    )
    const transactionsAmount = transactions.reduce(
        (acc, current) => acc + current.amount,
        0
    )

    const balance = rechargesAmount - transactionsAmount
    return { balance, transactions, recharges }
}
