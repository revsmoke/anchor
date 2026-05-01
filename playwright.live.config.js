import { defineConfig, devices } from "@playwright/test";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

const port = Number(process.env.ANCHOR_LIVE_TEST_PORT ?? 3211);
const audioFixture = resolve(process.env.LIVE_OPENAI_AUDIO_FIXTURE ?? "tests/fixtures/live-openai-audio.wav");
const chromiumArgs = [
  "--use-fake-ui-for-media-stream",
  "--use-fake-device-for-media-stream"
];

if (existsSync(audioFixture)) {
  chromiumArgs.push(`--use-file-for-fake-audio-capture=${audioFixture}`);
}

export default defineConfig({
  testDir: "./tests/browser",
  testMatch: /live-openai.*\.spec\.js/,
  workers: 1,
  timeout: 60000,
  webServer: {
    command: `PORT=${port} OPENAI_REALTIME_LIVE_TEST=1 FORCE_REALTIME_NETWORK=1 bun server/index.js`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 15000
  },
  use: {
    ...devices["Desktop Chrome"],
    baseURL: `http://127.0.0.1:${port}`,
    permissions: ["microphone"],
    trace: "off",
    video: "off",
    launchOptions: {
      args: chromiumArgs
    }
  },
  projects: [
    {
      name: "chromium-live-openai",
      use: { browserName: "chromium" }
    }
  ]
});
