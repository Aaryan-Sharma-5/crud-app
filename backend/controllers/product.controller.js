const Product = require('../models/product.model');

// Get all products
const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      message: error.message || 'Error fetching products',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// Get a single product by ID
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: error.message });
  }
}

// Create a new product 
const createProduct = async (req, res) => {
  try {
    const productData = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      quantity: req.body.quantity ? Number(req.body.quantity) : undefined
    };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: error.message });
  }
}

// Update a product
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const productData = {
      ...req.body,
      price: req.body.price ? Number(req.body.price) : undefined,
      quantity: req.body.quantity ? Number(req.body.quantity) : undefined
    };
    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a product
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct };