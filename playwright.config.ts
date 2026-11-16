import { defineConfig, devices } from "@playwright/test";

const PORT = 4321;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env["CI"],
  // No retries: a flaky test should fail loudly rather than pass on rerun.
  retries: 0,
  reporter: process.env["CI"]
    ? [["github"], ["list"], ["html", { open: "never" }]]
    : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    // Traces of failed tests in the CI report (with retries: 0, "on-first-retry"
    // would never record). Off locally: tracing ~10 parallel workers is slow.
    trace: process.env["CI"] ? "retain-on-failure" : "off",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // Serves the production build (run `npm run build` first).
    command: `npm run preview -- --port ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env["CI"],
    timeout: 120_000,
  },
});
