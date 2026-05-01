import { spawn } from "node:child_process";
import { requireLiveOpenAiConfig, redactSecretText } from "./live-openai-config.js";
import { seedLiveTestData } from "./live-test-seed-data.js";
import { generateLiveAudioFixture } from "./generate-live-audio-fixture.js";

async function main() {
  let liveConfig;
  try {
    liveConfig = requireLiveOpenAiConfig(process.env);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const audioFixture = await generateLiveAudioFixture();
  const seeded = await seedLiveTestData();
  console.log(`seeded ${seeded.email}`);
  console.log(JSON.stringify(seeded.counts, null, 2));

  const env = {
    ...process.env,
    OPENAI_REALTIME_LIVE_TEST: "1",
    FORCE_REALTIME_NETWORK: "1",
    REALTIME_MODEL: liveConfig.realtimeModel,
    OPENAI_REALTIME_CALLS_URL: liveConfig.openaiRealtimeCallsUrl,
    LIVE_OPENAI_AUDIO_FIXTURE: audioFixture,
    ANCHOR_LIVE_TEST_PORT: process.env.ANCHOR_LIVE_TEST_PORT ?? "3211"
  };

  await run("bun", ["test", "tests/live"], env);
  await run("bunx", ["playwright", "test", "-c", "playwright.live.config.js"], env);
}

function run(command, args, env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      env,
      stdio: ["ignore", "pipe", "pipe"]
    });

    child.stdout.on("data", chunk => process.stdout.write(redactSecretText(chunk, env)));
    child.stderr.on("data", chunk => process.stderr.write(redactSecretText(chunk, env)));
    child.on("error", reject);
    child.on("close", code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${command} ${args.join(" ")} failed with exit code ${code}`));
      }
    });
  });
}

await main();
