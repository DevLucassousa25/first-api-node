import setupKnex from "knex";
import { env } from "./env/index.ts";

export const config = {
    client: "sqlite",
    connection: {
        filename: env.DATABASE_URL
    },
    useNullAsDefault: true,
    migrations: {
        extension: "ts",
        directory: "./temp/migrations",
    },
}

export const knexConnection = setupKnex(config);
