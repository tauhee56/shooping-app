/**
 * In-Memory Mock Database for Development
 * Used when MongoDB is not available
 * Data persists only during session
 */

interface User {
  _id: string;
  email?: string;
  [key: string]: any;
}
interface Store {
  _id: string;
  owner?: string;
  products?: string[];
  [key: string]: any;
}
interface Product {
  _id: string;
  store?: string;
  [key: string]: any;
}
interface Order {
  _id: string;
  buyer?: string;
  [key: string]: any;
}
interface Message {
  _id: string;
  sender?: string;
  receiver?: string;
  [key: string]: any;
}

let users: User[] = [];
let products: Product[] = [];
let stores: Store[] = [];
let orders: Order[] = [];
let messages: Message[] = [];

// Auto-increment IDs
let userIdCounter = 1;
let productIdCounter = 1;
let storeIdCounter = 1;
let orderIdCounter = 1;
let messageIdCounter = 1;

const mockDB = {
  // Users
  createUser: (userData: Partial<User>) => {
    const user = { _id: `user_${userIdCounter++}`, ...userData, createdAt: new Date() };
    users.push(user);
    return user;
  },
  findUser: (query: Partial<User>) => users.find(u => {
    if (query.email) return u.email === query.email;
    if (query._id) return u._id === query._id;
    return false;
  }),
  findUserById: (id: string) => users.find(u => u._id === id),
  getAllUsers: (): User[] => users,
  updateUser: (id: string, updates: Partial<User>) => {
    const user = users.find(u => u._id === id);
    if (user) Object.assign(user, updates);
    return user;
  },

  // Stores
  createStore: (storeData: Partial<Store>) => {
    const store = { _id: `store_${storeIdCounter++}`, ...storeData, createdAt: new Date(), products: [] };
    stores.push(store);
    return store;
  },
  findStore: (query: Partial<Store>) => stores.find(s => {
    if (query._id) return s._id === query._id;
    if (query.owner) return s.owner === query.owner;
    return false;
  }),
  findStoreById: (id: string) => stores.find(s => s._id === id),
  getAllStores: (): Store[] => stores,
  updateStore: (id: string, updates: Partial<Store>) => {
    const store = stores.find(s => s._id === id);
    if (store) Object.assign(store, updates);
    return store;
  },

  // Products
  createProduct: (productData: Partial<Product>) => {
    const product = { _id: `product_${productIdCounter++}`, ...productData, createdAt: new Date() };
    products.push(product);
    return product;
  },
  findProduct: (query: Partial<Product>) => products.find(p => {
    if (query._id) return p._id === query._id;
    if (query.store) return p.store === query.store;
    return false;
  }),
  findProductById: (id: string) => products.find(p => p._id === id),
  getAllProducts: (): Product[] => products,
  updateProduct: (id: string, updates: Partial<Product>) => {
    const product = products.find(p => p._id === id);
    if (product) Object.assign(product, updates);
    return product;
  },
  deleteProduct: (id: string) => {
    products = products.filter(p => p._id !== id);
    return true;
  },

  // Orders
  createOrder: (orderData: Partial<Order>) => {
    const order = { _id: `order_${orderIdCounter++}`, ...orderData, createdAt: new Date() };
    orders.push(order);
    return order;
  },
  findOrder: (query: Partial<Order>) => orders.find(o => {
    if (query._id) return o._id === query._id;
    if (query.buyer) return o.buyer === query.buyer;
    return false;
  }),
  findOrderById: (id: string) => orders.find(o => o._id === id),
  getAllOrders: (): Order[] => orders,
  getUserOrders: (userId: string) => orders.filter(o => o.buyer === userId),
  updateOrder: (id: string, updates: Partial<Order>) => {
    const order = orders.find(o => o._id === id);
    if (order) Object.assign(order, updates);
    return order;
  },

  // Messages
  createMessage: (messageData: Partial<Message>) => {
    const message = { _id: `message_${messageIdCounter++}`, ...messageData, createdAt: new Date(), isRead: false };
    messages.push(message);
    return message;
  },
  findMessage: (query: Partial<Message>) => messages.find(m => {
    if (query._id) return m._id === query._id;
    return false;
  }),
  getConversations: (userId: string) => {
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
  getMessagesBetween: (userId: string, otherId: string) => messages.filter(m => 
    (m.sender === userId && m.receiver === otherId) || 
    (m.sender === otherId && m.receiver === userId)
  ).sort((a, b) => {
    const aTime = new Date(a.createdAt).getTime();
    const bTime = new Date(b.createdAt).getTime();
    return aTime - bTime;
  }),
  markMessageAsRead: (id: string) => {
    const message = messages.find(m => m._id === id);
    if (message) message.isRead = true;
    return message;
  },
  getAllMessages: (): Message[] => messages,

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
