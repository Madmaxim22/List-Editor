/**
 * Интеграционные тесты с использованием Puppeteer
 */

describe('Интеграционные тесты приложения "Редактор списка товаров"', () => {
  let browser;
  let page;

  beforeAll(async () => {
    // Загружаем главную страницу приложения
    const puppeteer = (await import('puppeteer')).default;
    const { puppeteerConfig } = await import('../../../puppeteer-config.js');
    browser = await puppeteer.launch(puppeteerConfig);
    page = await browser.newPage();
    await page.goto('http://localhost:5000');
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    // Очищаем localStorage перед каждым тестом
    await page.evaluate(() => localStorage.clear());
    // Перезагружаем страницу, чтобы убедиться, что она чистая
    await page.reload({ waitUntil: 'networkidle0' });
  });

  test('Проверка отображения пустого списка товаров', async () => {
    // Проверяем, что на странице есть заголовок
    const header = await page.$eval('h1', (el) => el.textContent);
    expect(header).toBe('Редактор списка товаров');

    // Проверяем, что список товаров пуст (нет элементов с классом product-item)
    const productItems = await page.$$('.product-item');
    expect(productItems.length).toBe(0);

    // Проверяем, что кнопка "Добавить товар" присутствует
    const addButton = await page.$('#add-button');
    expect(addButton).toBeTruthy();
  });

  test('Добавление нового товара через модальное окно', async () => {
    // Нажимаем кнопку "Добавить товар"
    await page.click('#add-button');

    // Ждем, пока модальное окно станет видимым
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'block'
    );

    // Проверяем, что модальное окно открылось
    const modalDisplayStyle = await page.$eval(
      '#modal',
      (el) => el.style.display
    );
    expect(modalDisplayStyle).toBe('block');

    // Заполняем поля формы
    await page.type('#name', 'Тестовый товар');
    await page.type('#description', 'Описание тестового товара');
    await page.type('#price', '99.99');

    // Нажимаем кнопку "Сохранить"
    await page.click('button[type="submit"]');

    // Ждем, пока модальное окно закроется
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'none'
    );

    // Проверяем, что модальное окно закрылось
    const modalDisplayStyleAfter = await page.$eval(
      '#modal',
      (el) => el.style.display
    );
    expect(modalDisplayStyleAfter).toBe('none');

    // Проверяем, что товар появился в списке
    await page.waitForSelector('.product-item', { timeout: 5000 }); // Увеличиваем таймаут
    const productItems = await page.$$('.product-item');
    expect(productItems.length).toBe(1);

    // Проверяем, что данные товара корректно отображаются
    const productName = await page.$eval(
      '.product-name',
      (el) => el.textContent
    );
    expect(productName).toBe('Тестовый товар');

    const productDescription = await page.$eval(
      '.product-description',
      (el) => el.textContent
    );
    expect(productDescription).toBe('Описание тестового товара');

    const productPrice = await page.$eval(
      '.product-price',
      (el) => el.textContent
    );
    expect(productPrice).toBe('99.99');
  });

  test('Редактирование существующего товара', async () => {
    // Сначала добавляем товар для последующего редактирования
    await page.click('#add-button');
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'block'
    );
    await page.type('#name', 'Старое название');
    await page.type('#description', 'Старое описание');
    await page.type('#price', '49.99');
    await page.click('button[type="submit"]');
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'none'
    );

    // Ждем появления товара в списке
    await page.waitForSelector('.product-item', { timeout: 5000 });

    // Нажимаем кнопку редактирования первого товара (иконка ✎)
    await page.click('.edit-btn');

    // Ждем, пока модальное окно станет видимым
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'block'
    );

    // Проверяем, что форма содержит правильные данные
    const nameValue = await page.$eval('#name', (el) => el.value);
    expect(nameValue).toBe('Старое название');

    const descriptionValue = await page.$eval('#description', (el) => el.value);
    expect(descriptionValue).toBe('Старое описание');

    const priceValue = await page.$eval('#price', (el) => el.value);
    expect(priceValue).toBe('49.99');

    // Изменяем данные
    await page.focus('#name');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#name', 'Новое название');

    await page.focus('#description');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#description', 'Новое описание');

    await page.focus('#price');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#price', '79.99');

    // Нажимаем кнопку "Сохранить"
    await page.click('button[type="submit"]');

    // Ждем, пока модальное окно закроется
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'none'
    );

    // Проверяем, что данные обновились в списке
    const updatedProductName = await page.$eval(
      '.product-name',
      (el) => el.textContent
    );
    expect(updatedProductName).toBe('Новое название');

    const updatedProductDescription = await page.$eval(
      '.product-description',
      (el) => el.textContent
    );
    expect(updatedProductDescription).toBe('Новое описание');

    const updatedProductPrice = await page.$eval(
      '.product-price',
      (el) => el.textContent
    );
    expect(updatedProductPrice).toBe('79.99');
  });

  test('Удаление товара', async () => {
    // Сначала добавляем товар для последующего удаления
    await page.click('#add-button');
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'block'
    );
    await page.type('#name', 'Товар для удаления');
    await page.type('#description', 'Описание товара');
    await page.type('#price', '29.99');
    await page.click('button[type="submit"]');
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'none'
    );

    // Ждем появления товара в списке
    await page.waitForSelector('.product-item', { timeout: 5000 });

    // Проверяем, что товар добавлен
    const initialProductCount = await page.$$('.product-item');
    expect(initialProductCount.length).toBe(1);

    // Нажимаем кнопку удаления (иконка ×)
    await page.click('.delete-btn');

    // Ждем, пока модальное окно подтверждения удаления станет видимым
    await page.waitForFunction(
      () => document.querySelector('#delete-modal').style.display === 'block'
    );

    // Проверяем, что модальное окно подтверждения удаления открылось
    const deleteModalDisplayStyle = await page.$eval(
      '#delete-modal',
      (el) => el.style.display
    );
    expect(deleteModalDisplayStyle).toBe('block');

    // Нажимаем кнопку "Удалить"
    await page.click('#confirm-delete');

    // Ждем, пока модальное окно закроется
    await page.waitForFunction(
      () => document.querySelector('#delete-modal').style.display === 'none'
    );

    // Проверяем, что модальное окно закрылось
    const deleteModalDisplayStyleAfter = await page.$eval(
      '#delete-modal',
      (el) => el.style.display
    );
    expect(deleteModalDisplayStyleAfter).toBe('none');

    // Проверяем, что товар удален из списка
    const finalProductCount = await page.$$('.product-item');
    expect(finalProductCount.length).toBe(0);
  });

  test('Валидация полей формы при добавлении товара', async () => {
    // Нажимаем кнопку "Добавить товар"
    await page.click('#add-button');

    // Ждем, пока модальное окно станет видимым
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'block'
    );

    // Проверяем, что модальное окно открылось
    const modalDisplayStyle = await page.$eval(
      '#modal',
      (el) => el.style.display
    );
    expect(modalDisplayStyle).toBe('block');

    // Убираем атрибуты required для тестирования JavaScript-валидации
    await page.$eval('#name', (el) => el.removeAttribute('required'));
    await page.$eval('#price', (el) => el.removeAttribute('required'));

    // Пытаемся отправить форму без заполнения обязательных полей
    await page.click('button[type="submit"]');

    // Проверяем наличие сообщений об ошибках
    await page.waitForFunction(
      () => document.getElementById('name-error').textContent !== '',
      { timeout: 5000 }
    );
    const nameError = await page.$eval('#name-error', (el) => el.textContent);
    expect(nameError).toContain('обязательно для заполнения');

    await page.waitForFunction(
      () => document.getElementById('price-error').textContent !== '',
      { timeout: 5000 }
    );
    const priceError = await page.$eval('#price-error', (el) => el.textContent);
    expect(priceError).toContain('обязательна для заполнения');

    // Заполняем только название, но не цену
    await page.type('#name', 'Тестовый товар');
    await page.click('button[type="submit"]');

    // Проверяем, что ошибка цены все еще отображается
    await page.waitForFunction(
      () => document.getElementById('price-error').textContent !== '',
      { timeout: 5000 }
    );
    const updatedPriceError = await page.$eval(
      '#price-error',
      (el) => el.textContent
    );
    expect(updatedPriceError).toContain('обязательна для заполнения');

    // Вводим невалидную цену (отрицательное значение)
    await page.focus('#price');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.type('#price', '-10');
    await page.click('button[type="submit"]');

    // Проверяем, что появляется ошибка валидации цены
    await page.waitForFunction(
      () => document.getElementById('price-error').textContent !== '',
      { timeout: 5000 }
    );
    const invalidPriceError = await page.$eval(
      '#price-error',
      (el) => el.textContent
    );
    expect(invalidPriceError).toContain('больше 0');

    // Возвращаем атрибуты required для других тестов
    await page.$eval('#name', (el) => el.setAttribute('required', ''));
    await page.$eval('#price', (el) => el.setAttribute('required', ''));
  });

  test('Закрытие модального окна по крестику', async () => {
    // Нажимаем кнопку "Добавить товар"
    await page.click('#add-button');

    // Ждем, пока модальное окно станет видимым
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'block'
    );

    // Проверяем, что модальное окно открылось
    const modalDisplayStyle = await page.$eval(
      '#modal',
      (el) => el.style.display
    );
    expect(modalDisplayStyle).toBe('block');

    // Нажимаем на крестик для закрытия модального окна
    await page.click('.close');

    // Ждем, пока модальное окно закроется
    await page.waitForFunction(
      () => document.querySelector('#modal').style.display === 'none'
    );

    // Проверяем, что модальное окно закрылось
    const modalDisplayStyleAfter = await page.$eval(
      '#modal',
      (el) => el.style.display
    );
    expect(modalDisplayStyleAfter).toBe('none');

    // Проверяем, что форма очищена после закрытия
    const nameValue = await page.$eval('#name', (el) => el.value);
    expect(nameValue).toBe('');

    const descriptionValue = await page.$eval('#description', (el) => el.value);
    expect(descriptionValue).toBe('');

    const priceValue = await page.$eval('#price', (el) => el.value);
    expect(priceValue).toBe('');
  });
});
