import { afterAll, beforeAll, it, describe, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { server } from '../app.ts'
import { execSync } from 'node:child_process'

describe('Transactions routes', () => {
    beforeAll(async () => {
        await server.ready()
    })

    afterAll(async () => {
        await server.close()
    })

    beforeEach(() => {
        execSync('npm run knex -- migrate:rollback --all')
        execSync('npm run knex -- migrate:latest')
    })

    it('shoudle be able to create a new transaction', async () => {
        await request(server.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 2000,
                type: 'credit'
            }).expect(201)
    })

    it('shoudle be able to list all transactions', async () => {
        const createTransactionResponse = await request(server.server)
            .post('/transactions')
            .send({
                title: 'New Transaction',
                amount: 2000,
                type: 'credit'
            })

        const cookies = createTransactionResponse.get('Set-Cookie') ?? []

        const listTransactionsResponse = await request(server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        expect(listTransactionsResponse.body.transactions).toEqual([
            expect.objectContaining({
                title: 'New Transaction',
                amount: 2000
            })
        ])
    })

    it('should be able to get a specific transaction', async () => {
        const createTransactionResponse = await request(server.server)
            .post('/transactions')
            .send({
                title: 'New transaction',
                amount: 5000,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie') ?? []

        const listTransactionsResponse = await request(server.server)
            .get('/transactions')
            .set('Cookie', cookies)
            .expect(200)

        const transactionId = listTransactionsResponse.body.transactions[0].id

        const getTransactionResponse = await request(server.server)
            .get(`/transactions/${transactionId}`)
            .set('Cookie', cookies)
            .expect(200)

        expect(getTransactionResponse.body.transaction).toEqual(
            expect.objectContaining({
                title: 'New transaction',
                amount: 5000,
            }),
        )
    })

    it('should be able to get the summary', async () => {
        const createTransactionResponse = await request(server.server)
            .post('/transactions')
            .send({
                title: 'Credit transaction',
                amount: 5000,
                type: 'credit',
            })

        const cookies = createTransactionResponse.get('Set-Cookie') ?? []

        await request(server.server)
            .post('/transactions')
            .set('Cookie', cookies)
            .send({
                title: 'Debit transaction',
                amount: 2000,
                type: 'debit',
            })

        const summaryResponse = await request(server.server)
            .get('/transactions/summary')
            .set('Cookie', cookies)
            .expect(200)

        expect(summaryResponse.body.summary).toEqual({
            amount: 3000,
        })
    })
})