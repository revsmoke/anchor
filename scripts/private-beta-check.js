import { getServerConfig } from "../server/config.js";
import { createDb } from "../server/db.js";
import { runPrivateBetaReadiness } from "../server/readiness.js";

const config = getServerConfig();
const db = createDb(config.databaseUrl);

try {
  const result = await runPrivateBetaReadiness({ db, config });
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) {
    process.exitCode = 1;
  }
} finally {
  await db.close();
}
