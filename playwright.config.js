const DEFAULT_PORT = 3210;
const parsedPort = Number(process.env.PORT ?? "");
const safePort = Number.isInteger(parsedPort) && parsedPort > 0 && parsedPort <= 65535
  ? parsedPort
  : DEFAULT_PORT;

export default {
  testDir: "./tests/browser",
  webServer: {
    command: `PORT=${safePort} bun server/index.js`,
    url: `http://127.0.0.1:${safePort}`,
    reuseExistingServer: false,
    timeout: 10000
  },
  use: {
    baseURL: `http://127.0.0.1:${safePort}`
  }
};
