/**
 * In-Memory Mock Database for Development
 * Used when MongoDB is not available
 * Data persists only during session
 */

let users = [];
let products = [];
let stores = [];
let orders = [];
let messages = [];

// Auto-increment IDs
let userIdCounter = 1;
let productIdCounter = 1;
let storeIdCounter = 1;
let orderIdCounter = 1;
let messageIdCounter = 1;

const mockDB = {
  // Users
  createUser: (userData) => {
    const user = { _id: `user_${userIdCounter++}`, ...userData, createdAt: new Date() };
    users.push(user);
    return user;
  },
  findUser: (query) => users.find(u => {
    if (query.email) return u.email === query.email;
    if (query._id) return u._id === query._id;
    return false;
  }),
  findUserById: (id) => users.find(u => u._id === id),
  getAllUsers: () => users,
  updateUser: (id, updates) => {
    const user = users.find(u => u._id === id);
    if (user) Object.assign(user, updates);
    return user;
  },

  // Stores
  createStore: (storeData) => {
    const store = { _id: `store_${storeIdCounter++}`, ...storeData, createdAt: new Date(), products: [] };
    stores.push(store);
    return store;
  },
  findStore: (query) => stores.find(s => {
    if (query._id) return s._id === query._id;
    if (query.owner) return s.owner === query.owner;
    return false;
  }),
  findStoreById: (id) => stores.find(s => s._id === id),
  getAllStores: () => stores,
  updateStore: (id, updates) => {
    const store = stores.find(s => s._id === id);
    if (store) Object.assign(store, updates);
    return store;
  },

  // Products
  createProduct: (productData) => {
    const product = { _id: `product_${productIdCounter++}`, ...productData, createdAt: new Date() };
    products.push(product);
    return product;
  },
  findProduct: (query) => products.find(p => {
    if (query._id) return p._id === query._id;
    if (query.store) return p.store === query.store;
    return false;
  }),
  findProductById: (id) => products.find(p => p._id === id),
  getAllProducts: () => products,
  updateProduct: (id, updates) => {
    const product = products.find(p => p._id === id);
    if (product) Object.assign(product, updates);
    return product;
  },
  deleteProduct: (id) => {
    products = products.filter(p => p._id !== id);
    return true;
  },

  // Orders
  createOrder: (orderData) => {
    const order = { _id: `order_${orderIdCounter++}`, ...orderData, createdAt: new Date() };
    orders.push(order);
    return order;
  },
  findOrder: (query) => orders.find(o => {
    if (query._id) return o._id === query._id;
    if (query.buyer) return o.buyer === query.buyer;
    return false;
  }),
  findOrderById: (id) => orders.find(o => o._id === id),
  getAllOrders: () => orders,
  getUserOrders: (userId) => orders.filter(o => o.buyer === userId),
  updateOrder: (id, updates) => {
    const order = orders.find(o => o._id === id);
    if (order) Object.assign(order, updates);
    return order;
  },

  // Messages
  createMessage: (messageData) => {
    const message = { _id: `message_${messageIdCounter++}`, ...messageData, createdAt: new Date(), isRead: false };
    messages.push(message);
    return message;
  },
  findMessage: (query) => messages.find(m => {
    if (query._id) return m._id === query._id;
    return false;
  }),
  getConversations: (userId) => {
    const partners = new Map();
    messages.forEach(m => {
      if (m.sender === userId || m.receiver === userId) {
        const partnerId = m.sender === userId ? m.receiver : m.sender;
        if (!partners.has(partnerId)) {
          partners.set(partnerId, m);
        }
      }
    });
    return Array.from(partners.values());
  },
  getMessagesBetween: (userId, otherId) => messages.filter(m => 
    (m.sender === userId && m.receiver === otherId) || 
    (m.sender === otherId && m.receiver === userId)
  ).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
  markMessageAsRead: (id) => {
    const message = messages.find(m => m._id === id);
    if (message) message.isRead = true;
    return message;
  },
  getAllMessages: () => messages,

  // Debug helpers
  clear: () => {
    users = [];
    products = [];
    stores = [];
    orders = [];
    messages = [];
    userIdCounter = 1;
    productIdCounter = 1;
    storeIdCounter = 1;
    orderIdCounter = 1;
    messageIdCounter = 1;
  },
  stats: () => ({
    users: users.length,
    products: products.length,
    stores: stores.length,
    orders: orders.length,
    messages: messages.length,
  }),
};

module.exports = mockDB;
