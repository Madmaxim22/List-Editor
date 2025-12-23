import { ProductManager } from '../../js/ProductManager.js';
import { ProductList } from '../../js/ProductModel.js';
import { View } from '../../js/View.js';
import { Validator } from '../../js/Validator.js';

// Моки для зависимостей
jest.mock('../../js/ProductModel.js', () => ({ ProductList: jest.fn(), }));

jest.mock('../../js/View.js', () => ({ View: jest.fn(), }));

describe('Менеджер товаров', () => {
  let productManager;
  let mockProductList;
  let mockView;

  beforeEach(() => {
    // Создаем моки для зависимостей
    mockProductList = {
      addProduct: jest.fn(),
      updateProduct: jest.fn(),
      deleteProduct: jest.fn(),
      getProductById: jest.fn(),
      getAllProducts: jest.fn(),
    };

    mockView = {
      addButton: document.createElement('button'),
      productForm: document.createElement('form'),
      modal: document.createElement('div'),
      deleteModal: document.createElement('div'),
      closeButtons: [ document.createElement('span') ],
      confirmDeleteButton: document.createElement('button'),
      cancelDeleteButton: document.createElement('button'),
      productIdInput: document.createElement('input'),
      nameInput: document.createElement('input'),
      descriptionInput: document.createElement('textarea'),
      priceInput: document.createElement('input'),
      modalTitle: document.createElement('h2'),
      productList: document.createElement('div'),

      // Методы View
      renderProducts: jest.fn(),
      setEventListenersForProducts: jest.fn(),
      displayErrors: jest.fn(),
      clearErrors: jest.fn(),
      resetForm: jest.fn(),
      setFormData: jest.fn(),
      getFormData: jest.fn(),
      setModalTitle: jest.fn(),
      openModal: jest.fn(),
      closeModal: jest.fn(),
      openDeleteModal: jest.fn(),
      closeDeleteModal: jest.fn(),
    };

    // Мокируем конструкторы
    View.mockImplementation(() => mockView);
    ProductList.mockImplementation(() => mockProductList);

    productManager = new ProductManager();
    productManager.productList = mockProductList;
    productManager.view = mockView;
  });

  test('должен инициализировать экземпляры ProductList и View', () => {
    expect(productManager.productList).toBe(mockProductList);
    expect(productManager.view).toBe(mockView);
    expect(productManager.currentEditId).toBeNull();
  });

  test('должен корректно обрабатывать клик по кнопке добавления', () => {
    productManager.handleAddClick();

    expect(mockView.setModalTitle).toHaveBeenCalledWith('Добавить товар');
    expect(mockView.resetForm).toHaveBeenCalled();
    expect(mockView.clearErrors).toHaveBeenCalled();
    expect(mockView.openModal).toHaveBeenCalled();
    expect(productManager.currentEditId).toBeNull();
  });

  test.each([
    [
      'товар существует',
      1,
      {
        id: 1,
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
      },
      true,
    ],
    [
      'товар не существует', 999, null, false
    ],
  ])(
    'должен корректно обрабатывать клик по кнопке редактирования когда %s',
    (testCase, productId, productData, shouldExist) => {
      mockProductList.getProductById.mockReturnValue(productData);

      productManager.handleEditClick(productId);

      expect(mockProductList.getProductById).toHaveBeenCalledWith(productId);

      if (shouldExist) {
        expect(mockView.setModalTitle).toHaveBeenCalledWith(
          'Редактировать товар'
        );
        expect(mockView.setFormData).toHaveBeenCalledWith(
          productId,
          productData.name,
          productData.description,
          productData.price
        );
        expect(mockView.clearErrors).toHaveBeenCalled();
        expect(mockView.openModal).toHaveBeenCalled();
        expect(productManager.currentEditId).toBe(productId);
      } else {
        expect(mockView.setModalTitle).not.toHaveBeenCalled();
        expect(mockView.openModal).not.toHaveBeenCalled();
      }
    }
  );

  test.each([
    [
      'добавление нового товара',
      null,
      'New Product',
      'New Description',
      '99.99',
      1,
    ],
    [
      'обновление существующего товара',
      1,
      'Updated Product',
      'Updated Description',
      '149.99',
      1,
    ],
  ])(
    'должен обрабатывать отправку формы для %s',
    (testCase, id, name, description, price, productId) => {
      const formData = {
        id: id,
        name: name,
        description: description,
        price: price,
      };
      mockView.getFormData.mockReturnValue(formData);

      if (id === null) {
        // Сценарий добавления
        mockProductList.addProduct.mockReturnValue({
          id: productId,
          ...formData,
          price: parseFloat(price),
        });
      } else {
        // Сценарий обновления
        mockProductList.updateProduct.mockReturnValue({
          id: productId,
          ...formData,
          price: parseFloat(price),
        });
      }

      const event = { preventDefault: jest.fn() };
      productManager.handleFormSubmit(event);

      expect(event.preventDefault).toHaveBeenCalled();

      if (id === null) {
        expect(mockProductList.addProduct).toHaveBeenCalledWith({
          name: name,
          description: description,
          price: parseFloat(price),
        });
      } else {
        expect(mockProductList.updateProduct).toHaveBeenCalledWith(id, {
          name: name,
          description: description,
          price: parseFloat(price),
        });
      }

      expect(mockView.renderProducts).toHaveBeenCalled();
      expect(mockView.closeModal).toHaveBeenCalled();
    }
  );

  test('должен обрабатывать клик по кнопке удаления', () => {
    productManager.handleDeleteClick(1);

    expect(productManager.currentEditId).toBe(1);
    expect(mockView.openDeleteModal).toHaveBeenCalled();
  });

  test.each([
    [
      'currentEditId установлен', 1, true
    ],
    [
      'currentEditId равен null', null, false
    ],
  ])(
    'должен корректно обрабатывать подтверждение удаления когда %s',
    (testCase, editId, shouldDelete) => {
      productManager.currentEditId = editId;

      productManager.handleConfirmDelete();

      if (shouldDelete) {
        expect(mockProductList.deleteProduct).toHaveBeenCalledWith(editId);
        expect(mockView.renderProducts).toHaveBeenCalled();
        expect(mockView.closeDeleteModal).toHaveBeenCalled();
        expect(productManager.currentEditId).toBeNull();
      } else {
        expect(mockProductList.deleteProduct).not.toHaveBeenCalled();
        expect(mockView.closeDeleteModal).not.toHaveBeenCalled();
      }
    }
  );

  test('должен обрабатывать отмену удаления', () => {
    productManager.handleCancelDelete();

    expect(mockView.closeDeleteModal).toHaveBeenCalled();
  });

  test.each([
    [
      'модальное окно', 'handleModalClose', 'closeModal', false
    ],
    [
      'модальное окно удаления',
      'handleDeleteModalClose',
      'closeDeleteModal',
      true,
    ],
  ])(
    'должен обрабатывать закрытие %s',
    (modalType, handlerMethod, viewMethod, needsEditId) => {
      if (needsEditId) {
        productManager.currentEditId = 1;
      }

      productManager[handlerMethod]();

      expect(mockView[viewMethod]).toHaveBeenCalled();

      if (needsEditId) {
        expect(productManager.currentEditId).toBeNull();
      } else {
        expect(mockView.resetForm).toHaveBeenCalled();
        expect(mockView.clearErrors).toHaveBeenCalled();
      }
    }
  );

  test('должен отображать список товаров', () => {
    const products = [
      {
        id: 1, name: 'Product 1', description: 'Desc', price: 10
      },
    ];
    mockProductList.getAllProducts.mockReturnValue(products);

    productManager.renderProducts();

    expect(mockProductList.getAllProducts).toHaveBeenCalled();
    expect(mockView.renderProducts).toHaveBeenCalledWith(products);
    expect(mockView.setEventListenersForProducts).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );
  });

  test.each([
    [
      'модальное окно', 'modal'
    ],
    [
      'модальное окно удаления', 'deleteModal'
    ],
  ])('должен закрывать %s при клике вне его области', (modalType, modalRef) => {
    // Создаем элементы для тестирования
    const modalElement = document.createElement('div');
    const otherElement = document.createElement('div');

    // Настраиваем моки
    mockView[modalRef] = modalElement;
    productManager.view = mockView;

    // Создаем mock-функции для обработчиков закрытия
    const spyHandler = jest.spyOn(
      productManager,
      modalRef === 'modal' ? 'handleModalClose' : 'handleDeleteModalClose'
    );

    // Создаем событие клика с целевым элементом (модальное окно)
    const event = { target: modalElement };

    // Вызываем обработчик события window.addEventListener
    // Получаем последний добавленный обработчик
    const addEventListenerSpy = jest.spyOn(window, 'addEventListener');

    // Инициализируем ProductManager заново, чтобы установить обработчики
    const freshProductManager = new ProductManager();
    freshProductManager.view = mockView;

    // Имитируем событие клика
    const clickEvent = new MouseEvent('click', { bubbles: true });
    Object.defineProperty(clickEvent, 'target', { value: modalElement });

    // Триггерим событие клика
    document.dispatchEvent(clickEvent);

    // Проверяем, что соответствующий обработчик закрытия был вызван
    expect(spyHandler).toHaveBeenCalled();
  });

  test('должен отображать ошибки валидации при отправке формы с некорректными данными', () => {
    const formData = {
      id: null,
      name: '', // Некорректное имя
      description: 'Test Description',
      price: 'invalid_price', // Некорректная цена
    };
    mockView.getFormData.mockReturnValue(formData);

    const event = { preventDefault: jest.fn() };
    productManager.handleFormSubmit(event);

    expect(event.preventDefault).toHaveBeenCalled();

    expect(mockView.displayErrors).toHaveBeenCalledWith({
      name: 'Название обязательно для заполнения',
      price: 'Цена должна быть числом',
    });
    // Проверяем, что методы для добавления/обновления продукта не были вызваны
    expect(mockProductList.addProduct).not.toHaveBeenCalled();
    expect(mockProductList.updateProduct).not.toHaveBeenCalled();
    // Проверяем, что форма не была сброшена и модальное окно не закрыто
    expect(mockView.closeModal).not.toHaveBeenCalled();
  });

  test('должен устанавливать правильные обработчики событий при отрисовке продуктов', () => {
    const products = [
      {
        id: 1, name: 'Product 1', description: 'Desc 1', price: 10
      },
      {
        id: 2, name: 'Product 2', description: 'Desc 2', price: 20
      },
    ];
    mockProductList.getAllProducts.mockReturnValue(products);

    productManager.renderProducts();

    expect(mockProductList.getAllProducts).toHaveBeenCalled();
    expect(mockView.renderProducts).toHaveBeenCalledWith(products);

    // Проверяем, что setEventListenersForProducts был вызван с двумя функциями
    expect(mockView.setEventListenersForProducts).toHaveBeenCalledWith(
      expect.any(Function),
      expect.any(Function)
    );

    // Проверяем, что переданные функции действительно являются обработчиками
    const [
      editHandler, deleteHandler
    ] =
      mockView.setEventListenersForProducts.mock.calls[0];

    // Проверяем, что функции являются функциями
    expect(typeof editHandler).toBe('function');
    expect(typeof deleteHandler).toBe('function');

    // Проверяем, что при вызове обработчиков они вызывают соответствующие методы
    const handleEditClickSpy = jest.spyOn(productManager, 'handleEditClick');
    const handleDeleteClickSpy = jest.spyOn(
      productManager,
      'handleDeleteClick'
    );

    const testId = 1;
    editHandler(testId);
    deleteHandler(testId);

    expect(handleEditClickSpy).toHaveBeenCalledWith(testId);
    expect(handleDeleteClickSpy).toHaveBeenCalledWith(testId);
  });
});
