/**
 * Класс для управления отображением
 */
export class View {
  constructor() {
    // Находим элементы DOM
    this.addButton = document.getElementById('add-button');
    this.productList = document.getElementById('product-list');
    this.modal = document.getElementById('modal');
    this.deleteModal = document.getElementById('delete-modal');
    this.productForm = document.getElementById('product-form');
    this.productIdInput = document.getElementById('product-id');
    this.nameInput = document.getElementById('name');
    this.descriptionInput = document.getElementById('description');
    this.priceInput = document.getElementById('price');
    this.modalTitle = document.getElementById('modal-title');
    this.closeButtons = document.querySelectorAll('.close');
    this.confirmDeleteButton = document.getElementById('confirm-delete');
    this.cancelDeleteButton = document.getElementById('cancel-delete');
  }

  // Отрисовка списка продуктов
  renderProducts(products) {
    // Очищаем текущий список
    this.productList.innerHTML = '';

    // Добавляем каждый продукт в grid
    products.forEach((product) => {
      const productItem = document.createElement('div');
      productItem.className = 'product-item';
      productItem.dataset.id = product.id;

      productItem.innerHTML = `
                <div class="product-name">${this.escapeHtml(product.name)}</div>
                <div class="product-description">${this.escapeHtml(
    product.description || ''
  )}</div>
                <div class="product-price">${product.price.toFixed(2)}</div>
                <div class="product-actions">
                    <button class="edit-btn" data-id="${product.id}">✎</button>
                    <button class="delete-btn" data-id="${
  product.id
}">×</button>
                </div>
            `;

      this.productList.append(productItem);
    });
  }

  // Установка обработчиков событий для кнопок
  setEventListenersForProducts(editCallback, deleteCallback) {
    // Удаляем предыдущие обработчики, чтобы избежать дублирования
    this.removeAllEventListeners();

    // Добавляем новые обработчики
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    editButtons.forEach((button) => {
      const id = parseInt(button.getAttribute('data-id'));
      const handler = () => editCallback(id);
      button.addEventListener('click', handler);
      // Сохраняем обработчик для возможности удаления
      button._editHandler = handler;
    });

    deleteButtons.forEach((button) => {
      const id = parseInt(button.getAttribute('data-id'));
      const handler = () => deleteCallback(id);
      button.addEventListener('click', handler);
      // Сохраняем обработчик для возможности удаления
      button._deleteHandler = handler;
    });
  }

  // Удаление всех обработчиков событий для кнопок
  removeAllEventListeners() {
    const editButtons = document.querySelectorAll('.edit-btn');
    const deleteButtons = document.querySelectorAll('.delete-btn');

    editButtons.forEach((button) => {
      if (button._editHandler) {
        button.removeEventListener('click', button._editHandler);
        delete button._editHandler;
      }
    });

    deleteButtons.forEach((button) => {
      if (button._deleteHandler) {
        button.removeEventListener('click', button._deleteHandler);
        delete button._deleteHandler;
      }
    });
  }

  // Отображение ошибок валидации
  displayErrors(errors) {
    this.clearErrors();

    if (errors.name) {
      this.showError('name-error', errors.name);
    }

    if (errors.price) {
      this.showError('price-error', errors.price);
    }
  }

  // Показать ошибку
  showError(elementId, message) {
    const errorElement = document.getElementById(elementId);

    errorElement.classList.add('show');
    errorElement.textContent = message;
  }

  // Очистка ошибок
  clearErrors() {
    const errorElements = document.querySelectorAll('.error-message');
    errorElements.forEach((element) => {
      element.textContent = '';
      element.classList.remove('show');
    });
  }

  // Сброс формы
  resetForm() {
    this.productIdInput.value = '';
    this.nameInput.value = '';
    this.descriptionInput.value = '';
    this.priceInput.value = '';

    this.clearErrors();
  }

  // Установка данных в форму
  setFormData(id, name, description, price) {
    this.productIdInput.value = id;
    this.nameInput.value = name;
    this.descriptionInput.value = description || '';
    this.priceInput.value = price;
  }

  // Получение данных из формы
  getFormData() {
    return {
      id: this.productIdInput.value
        ? parseInt(this.productIdInput.value)
        : null,
      name: this.nameInput.value.trim(),
      description: this.descriptionInput.value.trim(),
      price: this.priceInput.value.trim(),
    };
  }

  // Установка заголовка модального окна
  setModalTitle(title) {
    this.modalTitle.textContent = title;
  }

  // Открытие модального окна
  openModal() {
    this.modal.style.display = 'block';
  }

  // Закрытие модального окна
  closeModal() {
    this.modal.style.display = 'none';
  }

  // Открытие модального окна удаления
  openDeleteModal() {
    this.deleteModal.style.display = 'block';
  }

  // Закрытие модального окна удаления
  closeDeleteModal() {
    this.deleteModal.style.display = 'none';
  }

  // Экранирование HTML для безопасности
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
