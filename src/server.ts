import { server } from "./app.ts"
import { env } from "./env/index.ts";

server.listen({ port: env.PORT }).then(() => {
    console.log("Server is running on port " + env.PORT);
});