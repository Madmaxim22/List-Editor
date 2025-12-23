import { Product, ProductList } from '../../js/ProductModel.js';

describe('Модель продукта', () => {
  describe('Продукт', () => {
    test('должен создать продукт с правильными свойствами', () => {
      const product = new Product(
        1,
        'Тестовый продукт',
        'Тестовое описание',
        99.99
      );

      expect(product.id).toBe(1);
      expect(product.name).toBe('Тестовый продукт');
      expect(product.description).toBe('Тестовое описание');
      expect(product.price).toBe(99.99);
    });
  });

  describe('Список продуктов', () => {
    let productList;

    beforeEach(() => {
      productList = new ProductList();
    });

    test('должен инициализироваться с пустым массивом продуктов', () => {
      expect(productList.products).toEqual([]);
      expect(productList.nextId).toBe(1);
    });

    test.each([
      [
        'с корректными данными',
        'Тестовый продукт',
        'Тестовое описание',
        99.99,
        1,
      ],
      [
        'с нулевой ценой', 'Тестовый продукт 2', 'Тестовое описание 2', 0, 1
      ],
      [
        'с отрицательной ценой',
        'Тестовый продукт 3',
        'Тестовое описание 3',
        -50,
        1,
      ],
    ])(
      'должен добавить новый товар %s',
      (testCase, name, description, price, expectedId) => {
        const productData = {
          name: name,
          description: description,
          price: price,
        };

        const addedProduct = productList.addProduct(productData);

        expect(productList.products.length).toBe(expectedId);
        expect(addedProduct.id).toBe(expectedId);
        expect(addedProduct.name).toBe(name);
        expect(addedProduct.description).toBe(description);
        expect(addedProduct.price).toBe(price);
      }
    );

    test('должен обновить существующий товар', () => {
      const productData = {
        name: 'Исходный продукт',
        description: 'Исходное описание',
        price: 99.99,
      };

      const addedProduct = productList.addProduct(productData);
      const updatedData = {
        name: 'Обновленный продукт',
        description: 'Обновленное описание',
        price: 149.99,
      };

      const updatedProduct = productList.updateProduct(
        addedProduct.id,
        updatedData
      );

      expect(updatedProduct.id).toBe(addedProduct.id);
      expect(updatedProduct.name).toBe('Обновленный продукт');
      expect(updatedProduct.description).toBe('Обновленное описание');
      expect(updatedProduct.price).toBe(149.99);
    });

    test('должен удалить товар', () => {
      const productData1 = {
        name: 'Продукт 1', description: '', price: 10
      };
      const productData2 = {
        name: 'Продукт 2', description: '', price: 20
      };

      const product1 = productList.addProduct(productData1);
      const product2 = productList.addProduct(productData2);

      expect(productList.products.length).toBe(2);

      productList.deleteProduct(product1.id);

      expect(productList.products.length).toBe(1);
      expect(productList.getProductById(product1.id)).toBeUndefined();
      expect(productList.getProductById(product2.id)).toBeDefined();
    });

    test.each([
      [
        'существующий ID',
        1,
        {
          name: 'Тестовый продукт',
          description: 'Тестовое описание',
          price: 99.99,
        },
        false,
      ],
      [
        'несуществующий ID', 999, null, true
      ],
    ])(
      'должен корректно обрабатывать %s',
      (testCase, id, productData, shouldBeUndefined) => {
        if (productData) {
          productList.addProduct(productData);
        }

        const retrievedProduct = productList.getProductById(id);

        if (shouldBeUndefined) {
          expect(retrievedProduct).toBeUndefined();
        } else {
          expect(retrievedProduct).toEqual(
            expect.objectContaining({
              name: productData.name,
              description: productData.description,
              price: productData.price,
            })
          );
        }
      }
    );

    test('должен получить все товары', () => {
      const productData1 = {
        name: 'Продукт 1', description: '', price: 10
      };
      const productData2 = {
        name: 'Продукт 2', description: '', price: 20
      };

      productList.addProduct(productData1);
      productList.addProduct(productData2);

      const allProducts = productList.getAllProducts();

      expect(allProducts.length).toBe(2);
      expect(allProducts[0].name).toBe('Продукт 1');
      expect(allProducts[1].name).toBe('Продукт 2');
    });
  });
});
