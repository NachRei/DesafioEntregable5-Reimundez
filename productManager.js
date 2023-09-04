const fs = require('fs').promises;

class productManager {
  constructor(filePath) {
    this.filePath = filePath;
  }

  async getProducts() {
    try {
      const data = await fs.readFile(this.filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      throw error;
    }
  }

  async getProductById(productId) {
    try {
      const products = await this.getProducts();
      return products.find(product => product.id === productId);
    } catch (error) {
      throw error;
    }
  }

  async addProduct(product) {
    try {
      const products = await this.getProducts();
      const newProduct = { ...product, id: products.length + 1 };
      products.push(newProduct);
      await this.saveProducts(products);
      return newProduct;
    } catch (error) {
      throw error;
    }
  }

  async updateProduct(productId, updatedProduct) {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex(product => product.id === productId);
      if (productIndex !== -1) {
        products[productIndex] = { ...updatedProduct, id: productId };
        await this.saveProducts(products);
        return products[productIndex];
      } else {
        return null;
      }
    } catch (error) {
      throw error;
    }
  }

  async deleteProduct(productId) {
    try {
      const products = await this.getProducts();
      const updatedProducts = products.filter(product => product.id !== productId);
      await this.saveProducts(updatedProducts);
      return true;
    } catch (error) {
      throw error;
    }
  }

  async saveProducts(products) {
    try {
      await fs.writeFile(this.filePath, JSON.stringify(products, null, 2));
    } catch (error) {
      throw error;
    }
  }
}

module.exports = productManager;
