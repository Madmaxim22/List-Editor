import { ProductList } from './ProductModel.js';
import { Validator } from './Validator.js';
import { View } from './View.js';

/**
 * Класс для управления продуктами (контроллер)
 */
export class ProductManager {
  constructor() {
    this.productList = new ProductList();
    this.view = new View();
    this.currentEditId = null;

    // Привязываем контекст методов
    this.handleFormSubmit = this.handleFormSubmit.bind(this);
    this.handleAddClick = this.handleAddClick.bind(this);
    this.handleEditClick = this.handleEditClick.bind(this);
    this.handleDeleteClick = this.handleDeleteClick.bind(this);
    this.handleConfirmDelete = this.handleConfirmDelete.bind(this);
    this.handleCancelDelete = this.handleCancelDelete.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);
    this.handleDeleteModalClose = this.handleDeleteModalClose.bind(this);

    this.init();
  }

  init() {
    // Привязываем обработчики событий
    this.view.addButton.addEventListener('click', this.handleAddClick);
    this.view.productForm.addEventListener('submit', this.handleFormSubmit);
    // Установка обработчиков для крестиков модальных окон
    this.setupCloseButtonHandlers();
    this.view.confirmDeleteButton.addEventListener(
      'click',
      this.handleConfirmDelete
    );
    this.view.cancelDeleteButton.addEventListener(
      'click',
      this.handleCancelDelete
    );

    // Закрытие модальных окон при клике вне их области
    window.addEventListener('click', (event) => {
      if (event.target === this.view.modal) {
        this.handleModalClose();
      } else if (event.target === this.view.deleteModal) {
        this.handleDeleteModalClose();
      }
    });

    // Инициализация начальных данных
    this.renderProducts();
  }

  // Открытие модального окна для добавления
  handleAddClick() {
    this.currentEditId = null;
    this.view.setModalTitle('Добавить товар');
    this.view.resetForm();
    this.view.clearErrors();
    this.view.openModal();
  }

  // Открытие модального окна для редактирования
  handleEditClick(id) {
    const product = this.productList.getProductById(id);
    if (!product) return;

    this.currentEditId = id;
    this.view.setModalTitle('Редактировать товар');
    this.view.setFormData(
      product.id,
      product.name,
      product.description,
      product.price
    );

    this.view.clearErrors();
    this.view.openModal();
  }

  // Обработка отправки формы
  handleFormSubmit(event) {
    event.preventDefault();

    const formData = this.view.getFormData();

    // Валидация данных
    const errors = Validator.validateProductData(formData.name, formData.price);

    if (Object.keys(errors).length > 0) {
      this.view.displayErrors(errors);
      return;
    }

    // Преобразование цены в число
    const priceValue = parseFloat(formData.price);

    if (formData.id) {
      // Обновление существующего продукта
      this.productList.updateProduct(formData.id, {
        name: formData.name,
        description: formData.description,
        price: priceValue,
      });
    } else {
      // Добавление нового продукта
      this.productList.addProduct({
        name: formData.name,
        description: formData.description,
        price: priceValue,
      });
    }

    // Обновляем отображение таблицы
    this.renderProducts();

    // Закрываем модальное окно
    this.handleModalClose();
  }

  // Обработка клика по кнопке удаления
  handleDeleteClick(id) {
    this.currentEditId = id;
    this.view.openDeleteModal();
  }

  // Подтверждение удаления
  handleConfirmDelete() {
    if (this.currentEditId !== null) {
      this.productList.deleteProduct(this.currentEditId);
      this.renderProducts();
      this.handleDeleteModalClose();
    }
  }

  // Отмена удаления
  handleCancelDelete() {
    this.handleDeleteModalClose();
  }

  // Закрытие модального окна
  handleModalClose() {
    this.view.closeModal();
    this.view.resetForm();
    this.view.clearErrors();
  }

  // Закрытие модального окна удаления
  handleDeleteModalClose() {
    this.view.closeDeleteModal();
    this.currentEditId = null;
  }

  // Отрисовка списка продуктов
  renderProducts() {
    const products = this.productList.getAllProducts();
    this.view.renderProducts(products);

    // Устанавливаем обработчики событий для новых кнопок
    this.view.setEventListenersForProducts(
      (id) => this.handleEditClick(id),
      (id) => this.handleDeleteClick(id)
    );
  }

  // Установка обработчиков для крестиков модальных окон
  setupCloseButtonHandlers() {
    this.view.closeButtons.forEach((button) => {
      button.addEventListener('click', (event) => {
        // Определяем, какое модальное окно нужно закрыть
        const modalParent = button.closest('.modal');
        if (modalParent === this.view.deleteModal) {
          this.handleDeleteModalClose();
        } else {
          this.handleModalClose();
        }
      });
    });
  }
}
