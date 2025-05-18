const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  imageUrl: {
    type: String,
    required: false
  }
},
  {
    timestamps: true
  }
);

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);