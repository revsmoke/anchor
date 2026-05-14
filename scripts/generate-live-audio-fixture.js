import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

const DEFAULT_PATH = "tests/fixtures/live-openai-audio.wav";

export async function generateLiveAudioFixture(path = DEFAULT_PATH) {
  const sampleRate = 48000;
  const seconds = 3;
  const sampleCount = sampleRate * seconds;
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let index = 0; index < sampleCount; index += 1) {
    const envelope = Math.min(1, index / (sampleRate * 0.1), (sampleCount - index) / (sampleRate * 0.1));
    const sample = Math.sin(2 * Math.PI * 440 * (index / sampleRate)) * 0.22 * envelope;
    buffer.writeInt16LE(Math.round(sample * 32767), 44 + index * 2);
  }

  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, buffer);
  return path;
}

if (import.meta.main) {
  const path = process.argv[2] ?? DEFAULT_PATH;
  await generateLiveAudioFixture(path);
  console.log(`generated ${path}`);
}
