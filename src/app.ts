import fastify from "fastify";
import { transactionsRoutes } from "./routes/transactions.ts";
import cookie from "@fastify/cookie"

export const server = fastify();

server.register(cookie)

server.addHook('preHandler', async (request, reply) => {
    console.log(`${request.method} - ${request.url}`)
})

server.register(transactionsRoutes, {
    prefix: 'transactions'
})
