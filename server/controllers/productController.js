const ProductModel = require('../models/productmode');

const getProducts = async () => {
  const products = await ProductModel.find({});
  return products;
}

const getProductById = async (_id) => {
  return ProductModel.findById(_id);
}

const createProduct = async (product) => {
  const newProduct = new ProductModel(product);
  return newProduct.save();
}

const updateProduct = async (_id, product) => {
  return ProductModel.findOneAndUpdate({ _id }, product, {
    upsert: false,
    new: true
  });
}

const deleteProduct = async (_id) => {
  return ProductModel.findOneAndDelete(_id);
}

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
}