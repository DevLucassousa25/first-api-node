import type { FastifyInstance } from "fastify";
import { z } from 'zod'
import { knexConnection } from "../database.ts";
import { randomUUID } from "node:crypto";
import { checkSessionID } from "../middleware/check-session-id.ts";

export async function transactionsRoutes(server: FastifyInstance) {

    server.get('/', {
        preHandler: [checkSessionID]
    }, async (request, reply) => {

        const { sessionId } = request.cookies

        if (!sessionId) {
            return reply.status(401).send({
                error: "Unauthorized"
            })
        }

        const transactions = await knexConnection('transactions')
            .where('session_id', sessionId).select()

        return { transactions }
    })

    server.post("/", async (request, reply) => {
        const createTransactionBodySchema = z.object({
            title: z.string(),
            amount: z.number(),
            type: z.enum(['credit', 'debit'])
        })

        const { title, amount, type } = createTransactionBodySchema.parse(request.body)

        let sessionId = request.cookies.sessionId

        if (!sessionId) {
            sessionId = randomUUID()

            reply.cookie('sessionId', sessionId, {
                path: '/',
                maxAge: 60 * 60 * 24 * 7 // 7 dias (em segundos)
            })
        }

        await knexConnection('transactions').insert({
            id: randomUUID(),
            title,
            amount: type === 'credit' ? amount : amount * -1,
            session_id: sessionId
        })

        return reply.status(201).send()
    });

    server.get("/:id", {
        preHandler: [checkSessionID]
    }, async (request) => {
        const getTransactionParamsSchema = z.object({
            id: z.string()
        })

        const { sessionId } = request.cookies

        const { id } = getTransactionParamsSchema.parse(request.params)

        const transaction = await knexConnection('transactions').where({
            'id': id,
            'session_id': sessionId
        }).first()

        return { transaction }
    })

    server.get('/summary', {
        preHandler: [checkSessionID]
    }, async (request) => {

        const { sessionId } = request.cookies

        const summary = await knexConnection('transactions').where('session_id', sessionId).sum('amount', {
            as: 'amount'
        }).first()

        return { summary }
    })
}