import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import postgres from "postgres";
import { getServerConfig } from "../server/config.js";

export async function runSqlDirectory(relativePath) {
  const { databaseUrl } = getServerConfig();
  const sql = postgres(databaseUrl, { max: 1 });

  try {
    const directory = new URL(`../${relativePath}`, import.meta.url).pathname;
    const files = (await readdir(directory))
      .filter(file => file.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const statement = await readFile(join(directory, file), "utf8");
      await sql.unsafe(statement);
      console.log(`ran ${relativePath}/${file}`);
    }
  } finally {
    await sql.end({ timeout: 1 });
  }
}
