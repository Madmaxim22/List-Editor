/**
 * Класс для валидации данных
 */
export class Validator {
  /**
   * Валидация данных продукта
   * @param {string} name - Название продукта
   * @param {string} priceStr - Цена продукта в виде строки
   * @returns {Object} Объект с ошибками валидации
   */
  static validateProductData(name, priceStr) {
    const errors = {};

    // Проверка наличия названия
    if (!name || !name.trim()) {
      errors.name = 'Название обязательно для заполнения';
    }

    // Проверка цены
    if (!priceStr) {
      errors.price = 'Цена обязательна для заполнения';
    } else {
      const price = parseFloat(priceStr);
      if (isNaN(price)) {
        errors.price = 'Цена должна быть числом';
      } else if (price <= 0) {
        errors.price = 'Цена должна быть числом больше 0';
      } else if (!isFinite(price)) {
        errors.price = 'Цена должна быть конечным числом';
      }
    }

    return errors;
  }
}
