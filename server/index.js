import { createApp } from "./app.js";
import { getServerConfig } from "./config.js";
import { createDb } from "./db.js";

const config = getServerConfig();
const db = createDb(config.databaseUrl);
const app = createApp({ db, config });

Bun.serve({
  port: config.port,
  fetch: app.fetch
});

console.log(`Anchor dev server running at http://127.0.0.1:${config.port}`);

process.on("SIGINT", async () => {
  await db.close();
  process.exit(0);
});
