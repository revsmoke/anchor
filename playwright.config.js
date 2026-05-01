const port = Number(process.env.PORT ?? 3210);

export default {
  testDir: "./tests/browser",
  webServer: {
    command: `PORT=${port} bun server/index.js`,
    url: `http://127.0.0.1:${port}`,
    reuseExistingServer: false,
    timeout: 10000
  },
  use: {
    baseURL: `http://127.0.0.1:${port}`
  }
};
