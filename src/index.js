import './css/style.css';
import { ProductManager } from './js/ProductManager.js';

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
  new ProductManager();
});
