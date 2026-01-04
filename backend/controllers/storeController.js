const Store = require('../models/Store');
const Product = require('../models/Product');

exports.createStore = async (req, res) => {
  try {
    const { name, description, location } = req.body;

    let store = await Store.findOne({ owner: req.user.userId });
    if (store) {
      return res.status(400).json({ message: 'You already have a store' });
    }

    store = new Store({
      name,
      owner: req.user.userId,
      description,
      location,
    });

    await store.save();

    // Update user as store owner
    const User = require('../models/User');
    await User.findByIdAndUpdate(req.user.userId, {
      isStore: true,
      storeId: store._id,
    });

    res.status(201).json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('owner', 'name profileImage bio')
      .populate('products');

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyStore = async (req, res) => {
  try {
    const store = await Store.findOne({ owner: req.user.userId })
      .populate('products');

    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateStore = async (req, res) => {
  try {
    const { name, description, location, banner, logo } = req.body;

    let store = await Store.findOne({ owner: req.user.userId });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    store.name = name || store.name;
    store.description = description || store.description;
    store.location = location || store.location;
    store.banner = banner || store.banner;
    store.logo = logo || store.logo;

    await store.save();
    res.json(store);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addProductToStore = async (req, res) => {
  try {
    const { name, description, price, originalPrice, category, images, ingredients, benefits, weight } = req.body;

    const store = await Store.findOne({ owner: req.user.userId });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const product = new Product({
      name,
      description,
      price,
      originalPrice,
      category,
      images,
      ingredients,
      benefits,
      weight,
      store: store._id,
    });

    await product.save();
    store.products.push(product._id);
    await store.save();

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.followStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    if (!store.followers.includes(req.user.userId)) {
      store.followers.push(req.user.userId);
      await store.save();
    }

    res.json({ message: 'Store followed', followers: store.followers.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, description, price, originalPrice, category, images } = req.body;

    const store = await Store.findOne({ owner: req.user.userId });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const product = await Product.findOne({ _id: productId, store: store._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price !== undefined ? price : product.price;
    product.originalPrice = originalPrice !== undefined ? originalPrice : product.originalPrice;
    product.category = category || product.category;
    product.images = images || product.images;

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const store = await Store.findOne({ owner: req.user.userId });
    if (!store) {
      return res.status(404).json({ message: 'Store not found' });
    }

    const product = await Product.findOne({ _id: productId, store: store._id });
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await Product.findByIdAndDelete(productId);
    store.products = store.products.filter(p => p.toString() !== productId);
    await store.save();

    res.json({ message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
