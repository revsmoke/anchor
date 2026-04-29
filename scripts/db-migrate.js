import { runSqlDirectory } from "./db-utils.js";

await runSqlDirectory("db/migrations");
