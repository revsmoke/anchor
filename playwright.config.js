export default {
  testDir: "./tests/browser",
  webServer: {
    command: "PORT=3210 bun server/index.js",
    url: "http://127.0.0.1:3210",
    reuseExistingServer: false,
    timeout: 10000
  },
  use: {
    baseURL: "http://127.0.0.1:3210"
  }
};
