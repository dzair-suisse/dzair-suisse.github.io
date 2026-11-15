import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"]
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Serves the production build (run `npm run build` first).
    command: `npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/dzair_epfl/`,
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  },
});
