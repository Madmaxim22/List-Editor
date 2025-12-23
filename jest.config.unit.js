/** @type {import('jest').Config} */

export default {
  // Задаёт окружение JSDOM для тестирования DOM-элементов в Node.js
  testEnvironment: 'jest-environment-jsdom',
  // Подключает расширения для expect, полезные для тестирования DOM
  setupFilesAfterEnv: [ '@testing-library/jest-dom' ],
  // Задаёт шаблон для поиска тестовых файлов (unit тесты)
  testMatch: [ '**/src/__tests__/unit/*.test.js' ],
  // Увеличиваем таймаут для тестов
  testTimeout: 1000,
  // Указываем, какие файлы не нужно покрывать тестами
  collectCoverageFrom: [
    'src/js/**/*.js',
    '!src/index.js',
    '!src/__tests__/**/*.js',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
