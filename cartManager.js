const fs = require('fs').promises;

class cartManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async createCart() {
    try {
      const newCart = { id: generateUniqueId(), products: [] };
      await this.saveCart(newCart);
      return newCart;
    } catch (error) {
      throw error;
    }
  }

  async getCartById(cartId) {
    try {
      const carts = await this.getCarts();
      return carts.find(cart => cart.id === cartId);
    } catch (error) {
      throw error;
    }
  }

  async addProductToCart(cartId, productId, quantity) {
    try {
      const carts = await this.getCarts();
      const cartIndex = carts.findIndex(cart => cart.id === cartId);
      if (cartIndex !== -1) {
        const cart = carts[cartIndex];
        const existingProduct = cart.products.find(product => product.id === productId);
        if (existingProduct) {
          existingProduct.quantity += quantity;
        } else {
          cart.products.push({ id: productId, quantity });
        }
        await this.saveCarts(carts);
        return cart;
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async getCarts() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw error;
    }
  }

  async saveCarts(carts) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(carts, null, 2));
    } catch (error) {
      throw error;
    }
  }
}

function generateUniqueId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

module.exports = cartManager;
