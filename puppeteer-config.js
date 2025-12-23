/**
 * Конфигурационный файл для Puppeteer
 */

export const puppeteerConfig = {
  headless: true, // Запуск в режиме без графического интерфейса
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-extensions',
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--disable-blink-features=AutomationControlled',
  ],
  defaultViewport: null, // Отключаем ограничение по размеру окна
  devtools: false, // Не открывать DevTools по умолчанию
  slowMo: 0, // Убираем замедление для ускорения выполнения тестов
};
