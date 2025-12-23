/** @type {import('jest').Config} */

export default {
  // Загружает предустановленную конфигурацию для тестирования с Puppeteer
  // (автоматически настраивает запуск браузера, хуки и т. д.).
  preset: 'jest-puppeteer',
  globalSetup: 'jest-environment-puppeteer/setup',
  globalTeardown: 'jest-environment-puppeteer/teardown',
  // Указывает, что тесты должны выполняться в окружении Puppeteer (с доступом к page, browser и т. п.).
  testEnvironment: 'jest-environment-puppeteer',
  // Подключает расширения для expect, позволяющие писать утверждения для Puppeteer:
  setupFilesAfterEnv: [ 'expect-puppeteer' ],
  // Задаёт шаблон для поиска тестовых файлов:
  testMatch: [ '**/src/__tests__/integration/*.puppeteer.test.js' ],
  testTimeout: 300000, // 30 секунд на тест
};
