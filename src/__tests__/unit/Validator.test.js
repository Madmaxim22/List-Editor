import { Validator } from '../../js/Validator.js';

describe('Валидатор', () => {
  test('должен вернуть пустой объект для корректных данных продукта', () => {
    const errors = Validator.validateProductData('Корректное название', '100');

    expect(errors).toEqual({});
  });

  test('должен вернуть ошибку для пустого имени', () => {
    const errors = Validator.validateProductData('', '100');

    expect(errors).toHaveProperty('name');
    expect(errors.name).toBe('Название обязательно для заполнения');
  });

  test.each([
    [
      '', 'Цена обязательна для заполнения'
    ],
    [
      'abc', 'Цена должна быть числом'
    ],
    [
      '-10', 'Цена должна быть числом больше 0'
    ],
    [
      '0', 'Цена должна быть числом больше 0'
    ],
  ])(
    'должен вернуть ошибку для некорректной цены \'%s\'',
    (price, expectedError) => {
      const errors = Validator.validateProductData(
        'Корректное название',
        price
      );

      expect(errors).toHaveProperty('price');
      expect(errors.price).toBe(expectedError);
    }
  );
});
