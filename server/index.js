import { buildServer } from "./src/app.js";
import { env } from "./src/env.js";

const app = await buildServer();

try {
  await app.listen({ port: env.PORT, host: "0.0.0.0" });
  app.log.info(`Server running on http://localhost:${env.PORT}`);
} catch (error) {
  app.log.error(error);
  process.exit(1);
}
