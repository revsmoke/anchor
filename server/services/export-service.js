import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

export function createArtifactStore(config) {
  return {
    async writeJson({ artifactId, payload }) {
      await mkdir(config.exportDir, { recursive: true });
      const storageKey = join(config.exportDir, `${artifactId}.json`);
      const serialized = JSON.stringify(payload, null, 2);
      await writeFile(storageKey, serialized);
      return {
        storageKey,
        byteSize: Buffer.byteLength(serialized)
      };
    },

    async readJson(storageKey) {
      return JSON.parse(await readFile(storageKey, "utf8"));
    },

    async delete(storageKey) {
      await rm(storageKey, { force: true });
    }
  };
}

export function redactPacketPayload(payload, redactions = {}) {
  if (!redactions.notes) return payload;
  return JSON.parse(JSON.stringify(payload, (key, value) => {
    if (key === "notes") return undefined;
    return value;
  }));
}
