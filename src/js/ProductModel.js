/**
 * Класс для представления продукта
 */
export class Product {
  constructor(id, name, description, price) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
  }
}

/**
 * Класс для управления списком продуктов
 */
export class ProductList {
  constructor() {
    this.products = [];
    this.nextId = 1;
  }

  // Добавление продукта
  addProduct(productData) {
    const newProduct = new Product(
      this.nextId++,
      productData.name,
      productData.description,
      productData.price
    );

    this.products.push(newProduct);
    return newProduct;
  }

  // Обновление продукта
  updateProduct(id, updatedData) {
    const index = this.products.findIndex((p) => p.id === id);
    if (index !== -1) {
      this.products[index] = new Product(
        id,
        updatedData.name,
        updatedData.description,
        updatedData.price
      );
      return this.products[index];
    }
    return null;
  }

  // Удаление продукта
  deleteProduct(id) {
    this.products = this.products.filter((p) => p.id !== id);
  }

  // Получение продукта по ID
  getProductById(id) {
    return this.products.find((p) => p.id === id);
  }

  // Получение всех продуктов
  getAllProducts() {
    return [ ...this.products ];
  }
}
