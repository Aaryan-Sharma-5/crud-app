const express = require('express');
const router = express.Router();

// Importing the controller functions
const { getProducts, getProduct, createProduct, updateProduct, deleteProduct } = require('../controllers/product.controller.js')

// Middleware to ensure DB connection
const connectDB = async (req, res, next) => {
  try {
    await require('mongoose').connection.db;
    next();
  } catch (error) {
    console.error("Database connection error in route:", error);
    res.status(500).json({ message: "Database connection error" });
  }
};

// Apply the middleware to all routes
router.use(connectDB);

// Routes using controller functions
router.get('/', getProducts);
router.get('/:id', getProduct);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);

module.exports = router;