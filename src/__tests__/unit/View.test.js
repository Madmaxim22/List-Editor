import { View } from '../../js/View.js';

// Мок для DOM элементов
const mockDOMElements = () => {
  document.body.innerHTML = `
    <div id="add-button">Add Button</div>
    <div id="product-list"></div>
    <div id="modal"></div>
    <div id="delete-modal"></div>
    <form id="product-form"></form>
    <input id="product-id">
    <input id="name">
    <textarea id="description"></textarea>
    <input id="price">
    <div id="modal-title"></div>
    <span class="close">x</span>
    <button id="confirm-delete">Confirm</button>
    <button id="cancel-delete">Cancel</button>
    <div id="name-error" class="error-message"></div>
    <div id="price-error" class="error-message"></div>
    <div id="product-list">
      <div class="product-item" data-id="1">
        <button class="edit-btn" data-id="1">✎</button>
        <button class="delete-btn" data-id="1">×</button>
      </div>
      <div class="product-item" data-id="2">
        <button class="edit-btn" data-id="2">✎</button>
        <button class="delete-btn" data-id="2">×</button>
      </div>
    </div>
  `;
};

describe('View', () => {
  let view;

  beforeEach(() => {
    mockDOMElements();
    view = new View();
  });

  test('должен инициализироваться с DOM элементами', () => {
    expect(view.addButton).toBeDefined();
    expect(view.productList).toBeDefined();
    expect(view.modal).toBeDefined();
    expect(view.deleteModal).toBeDefined();
    expect(view.productForm).toBeDefined();
    expect(view.productIdInput).toBeDefined();
    expect(view.nameInput).toBeDefined();
    expect(view.descriptionInput).toBeDefined();
    expect(view.priceInput).toBeDefined();
    expect(view.modalTitle).toBeDefined();
    expect(view.closeButtons).toBeDefined();
    expect(view.confirmDeleteButton).toBeDefined();
    expect(view.cancelDeleteButton).toBeDefined();
  });

  test('должен корректно отображать товары', () => {
    const products = [
      {
        id: 1, name: 'Product 1', description: 'Description 1', price: 10.99
      },
      {
        id: 2, name: 'Product 2', description: 'Description 2', price: 20.99
      },
    ];

    view.renderProducts(products);

    // Проверяем, что продукты отрендерились
    expect(view.productList.innerHTML).toContain('Product 1');
    expect(view.productList.innerHTML).toContain('Product 2');
    expect(view.productList.innerHTML).toContain('10.99');
    expect(view.productList.innerHTML).toContain('20.99');
  });

  test('должен очищать ошибки', () => {
    document.getElementById('name-error').textContent = 'Sample error';
    document.getElementById('price-error').textContent = 'Another error';

    view.clearErrors();

    expect(document.getElementById('name-error').textContent).toBe('');
    expect(document.getElementById('price-error').textContent).toBe('');
    expect(document.querySelector('#name-error.show')).toBeNull();
    expect(document.querySelector('#price-error.show')).toBeNull();
  });

  test('должен корректно отображать ошибки', () => {
    const errors = {
      name: 'Name error message',
      price: 'Price error message',
    };

    view.displayErrors(errors);

    expect(document.getElementById('name-error').textContent).toBe(
      'Name error message'
    );
    expect(document.getElementById('price-error').textContent).toBe(
      'Price error message'
    );
  });

  test('должен сбрасывать форму', () => {
    view.productIdInput.value = '123';
    view.nameInput.value = 'Test Name';
    view.descriptionInput.value = 'Test Description';
    view.priceInput.value = '99.99';

    view.resetForm();

    expect(view.productIdInput.value).toBe('');
    expect(view.nameInput.value).toBe('');
    expect(view.descriptionInput.value).toBe('');
    expect(view.priceInput.value).toBe('');
  });

  test('должен корректно устанавливать данные формы', () => {
    view.setFormData(1, 'Test Name', 'Test Description', '99.99');

    expect(view.productIdInput.value).toBe('1');
    expect(view.nameInput.value).toBe('Test Name');
    expect(view.descriptionInput.value).toBe('Test Description');
    expect(view.priceInput.value).toBe('99.99');
  });

  test.each([
    [
      'с данными', '1', 'Test Name', 'Test Description', '99.99', 1
    ],
    [
      'с пустым ID', '', 'Test Name', 'Test Description', '99.9', null
    ],
  ])(
    'должен корректно обрабатывать получение данных формы %s',
    (testCase, id, name, description, price, expectedId) => {
      view.productIdInput.value = id;
      view.nameInput.value = name;
      view.descriptionInput.value = description;
      view.priceInput.value = price;

      const formData = view.getFormData();

      expect(formData.id).toBe(expectedId);
      expect(formData.name).toBe(name);
      expect(formData.description).toBe(description);
      expect(formData.price).toBe(price);
    }
  );

  test('должен устанавливать заголовок модального окна', () => {
    view.setModalTitle('New Title');

    expect(view.modalTitle.textContent).toBe('New Title');
  });

  test.each([
    [
      'модальное окно', 'openModal', 'closeModal', 'modal'
    ],
    [
      'модальное окно удаления',
      'openDeleteModal',
      'closeDeleteModal',
      'deleteModal',
    ],
  ])(
    'должен открывать и закрывать %s',
    (modalType, openMethod, closeMethod, modalProperty) => {
      view[openMethod]();
      expect(view[modalProperty].style.display).toBe('block');

      view[closeMethod]();
      expect(view[modalProperty].style.display).toBe('none');
    }
  );

  test('должен корректно экранировать HTML', () => {
    const maliciousHTML = '<script>alert("XSS")</script>';
    const escaped = view.escapeHtml(maliciousHTML);

    expect(escaped).not.toContain('<script>');
    expect(escaped).toContain('&lt;script&gt;alert("XSS")&lt;/script&gt;');
    expect(escaped).toContain('alert');
  });

  describe('Обработчики событий', () => {
    test('должен устанавливать обработчики событий для кнопок редактирования и удаления', () => {
      // Подготовка тестовых данных
      const mockEditCallback = jest.fn();
      const mockDeleteCallback = jest.fn();

      // Устанавливаем обработчики
      view.setEventListenersForProducts(mockEditCallback, mockDeleteCallback);

      // Находим кнопки
      const editButton = document.querySelector('.edit-btn[data-id="1"]');
      const deleteButton = document.querySelector('.delete-btn[data-id="1"]');

      // Проверяем, что обработчики были установлены
      expect(editButton._editHandler).toBeDefined();
      expect(deleteButton._deleteHandler).toBeDefined();

      // Симулируем клики
      editButton.click();
      expect(mockEditCallback).toHaveBeenCalledWith(1);

      deleteButton.click();
      expect(mockDeleteCallback).toHaveBeenCalledWith(1);
    });

    test('должен удалять все обработчики событий', () => {
      // Подготовка тестовых данных
      const mockEditCallback = jest.fn();
      const mockDeleteCallback = jest.fn();

      // Устанавливаем обработчики
      view.setEventListenersForProducts(mockEditCallback, mockDeleteCallback);

      // Находим кнопки
      const editButton = document.querySelector('.edit-btn[data-id="1"]');
      const deleteButton = document.querySelector('.delete-btn[data-id="1"]');

      // Проверяем, что обработчики были установлены
      expect(editButton._editHandler).toBeDefined();
      expect(deleteButton._deleteHandler).toBeDefined();

      // Удаляем обработчики
      view.removeAllEventListeners();

      // Проверяем, что обработчики были удалены
      expect(editButton._editHandler).toBeUndefined();
      expect(deleteButton._deleteHandler).toBeUndefined();

      // Симулируем клики после удаления обработчиков
      editButton.click();
      expect(mockEditCallback).toHaveBeenCalledTimes(0);

      deleteButton.click();
      expect(mockDeleteCallback).toHaveBeenCalledTimes(0);
    });

    test('должен удалять предыдущие обработчики при повторной установке', () => {
      // Подготовка тестовых данных
      const firstEditCallback = jest.fn();
      const firstDeleteCallback = jest.fn();
      const secondEditCallback = jest.fn();
      const secondDeleteCallback = jest.fn();

      // Устанавливаем первые обработчики
      view.setEventListenersForProducts(firstEditCallback, firstDeleteCallback);

      // Находим кнопки
      const editButton = document.querySelector('.edit-btn[data-id="1"]');
      const deleteButton = document.querySelector('.delete-btn[data-id="1"]');

      // Проверяем, что обработчики были установлены
      expect(editButton._editHandler).toBeDefined();
      expect(deleteButton._deleteHandler).toBeDefined();

      // Симулируем клики
      editButton.click();
      expect(firstEditCallback).toHaveBeenCalledWith(1);
      expect(secondEditCallback).not.toHaveBeenCalled();

      deleteButton.click();
      expect(firstDeleteCallback).toHaveBeenCalledWith(1);
      expect(secondDeleteCallback).not.toHaveBeenCalled();

      // Устанавливаем новые обработчики
      view.setEventListenersForProducts(
        secondEditCallback,
        secondDeleteCallback
      );

      // Симулируем клики снова
      editButton.click();
      expect(firstEditCallback).toHaveBeenCalledTimes(1); // Не должно вызваться снова
      expect(secondEditCallback).toHaveBeenCalledWith(1);

      deleteButton.click();
      expect(firstDeleteCallback).toHaveBeenCalledTimes(1); // Не должно вызваться снова
      expect(secondDeleteCallback).toHaveBeenCalledWith(1);
    });
  });
});
