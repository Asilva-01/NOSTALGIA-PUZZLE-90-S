import { defineConfig, devices } from '@playwright/test';

const nostalgiaPort = 4173;
const biblePort = 4174;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    trace: 'on-first-retry',
    locale: 'pt-BR',
  },
  webServer: [
    {
      command: 'npx vite preview --host 127.0.0.1 --strictPort',
      cwd: 'apps/nostalgia-90',
      url: `http://127.0.0.1:${nostalgiaPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: 'npx vite preview --host 127.0.0.1 --strictPort',
      cwd: 'apps/bible-puzzle',
      url: `http://127.0.0.1:${biblePort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
  ],
  projects: [
    {
      name: 'nostalgia-mobile-360',
      testMatch: 'puzzle-12.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 640 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'nostalgia-mobile-390',
      testMatch: 'puzzle-12.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'nostalgia-tablet',
      testMatch: 'puzzle-12.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 768, height: 1024 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
        hasTouch: true,
      },
    },
    {
      name: 'nostalgia-desktop',
      testMatch: 'puzzle-12.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
      },
    },
    {
      name: 'bible-smoke',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${biblePort}`,
        hasTouch: true,
        isMobile: true,
      },
      testMatch: 'bible-smoke.spec.ts',
    },
    {
      name: 'nostalgia-24',
      testMatch: 'puzzle-24.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'bible-12',
      testMatch: 'puzzle-12.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${biblePort}`,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'bible-24',
      testMatch: 'puzzle-24.spec.ts',
      use: {
        browserName: 'chromium',
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${biblePort}`,
        hasTouch: true,
        isMobile: true,
      },
    },
    {
      name: 'nostalgia-shot-390',
      testMatch: 'screenshots.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
      },
    },
    {
      name: 'nostalgia-shot-desktop',
      testMatch: 'screenshots.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
        baseURL: `http://127.0.0.1:${nostalgiaPort}`,
      },
    },
    {
      name: 'bible-shot-390',
      testMatch: 'screenshots.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
        baseURL: `http://127.0.0.1:${biblePort}`,
      },
    },
    {
      name: 'bible-shot-desktop',
      testMatch: 'screenshots.spec.ts',
      use: {
        browserName: 'chromium',
        viewport: { width: 1280, height: 800 },
        baseURL: `http://127.0.0.1:${biblePort}`,
      },
    },
  ],
});
