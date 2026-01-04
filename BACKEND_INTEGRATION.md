# Backend Integration Setup

## Backend Setup Complete ✅

### New Backend Features Added:

1. **Message/Chat System**
   - Model: `Message.js`
   - Controller: `messageController.js`
   - Routes: `/api/messages`
   - Endpoints:
     - POST `/api/messages` - Send message
     - GET `/api/messages/conversations` - Get all conversations
     - GET `/api/messages/:userId` - Get messages with specific user
     - PUT `/api/messages/:messageId/read` - Mark as read
     - GET `/api/messages/unread-count` - Get unread count

2. **Store Product Management**
   - PUT `/api/stores/:id/products/:productId` - Update product
   - DELETE `/api/stores/:id/products/:productId` - Delete product

### Frontend API Integration Complete:

1. **API Utility (`mobile/src/utils/api.js`)**
   - ✅ Auth APIs (login, register, profile, follow)
   - ✅ Product APIs (get all, by ID, like, featured, by store)
   - ✅ Store APIs (create, get, update, add product, update product, delete product, follow)
   - ✅ Order APIs (create, get orders, by ID, update status)
   - ✅ Message APIs (send, conversations, get messages, mark read, unread count)

2. **Connected Screens:**

   **Messaging:**
   - `InboxScreen.js` → Loads real conversations from backend
   - `ChatDetailScreen.js` → Sends/receives real messages with KeyboardAvoidingView

   **Orders:**
   - `CheckoutScreen.js` → Creates real orders via API
   - `OrdersScreen.js` → Can fetch from backend
   
   **Store Management:**
   - `EditStoreScreen.js` → Updates store via API
   - `EditProductScreen.js` → Updates products via API
   - `MyStoreScreen.js` → Deletes products via API

   **Authentication:**
   - `LoginScreen.js` → Uses AuthContext
   - `RegisterScreen.js` → Uses AuthContext
   - Auth tokens stored in AsyncStorage

### How to Start Backend:

```bash
cd backend
npm install
node server.js
```

Make sure `.env` file contains:
```
MONGODB_URI=mongodb://localhost:27017/shoppingapp
PORT=5000
JWT_SECRET=your_secret_key_here
```

### How to Update Frontend API URL:

In `mobile/src/utils/api.js`, change:
```javascript
const API_URL = 'http://YOUR_IP:5000/api';
```

Find your IP:
```bash
ipconfig  # Windows
ifconfig  # Mac/Linux
```

### Testing the Integration:

1. **Start Backend:**
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend:**
   ```bash
   cd mobile
   npx expo start -c
   ```

3. **Test Features:**
   - ✅ Register new user
   - ✅ Login
   - ✅ Create store
   - ✅ Add products
   - ✅ Edit/Delete products
   - ✅ Send messages
   - ✅ View conversations
   - ✅ Place orders
   - ✅ Like products
   - ✅ Follow stores

### API Authentication:

All protected routes require JWT token in header:
```
Authorization: Bearer <token>
```

Token is automatically added by axios interceptor after login.

### Database Models:

1. **User** - name, email, password, isStore, storeId, followers, following
2. **Store** - name, owner, description, logo, banner, location, followers, products
3. **Product** - name, description, price, store, images, category, likes, reviews
4. **Order** - user, items, shippingAddress, paymentMethod, status, totalAmount
5. **Message** - sender, receiver, store, content, isRead, createdAt

### Next Steps:

1. Test all API endpoints with real data
2. Add image upload functionality (multer)
3. Add real-time messaging (Socket.IO)
4. Add push notifications
5. Add payment gateway integration

### API URL Configuration:

Update this in `mobile/src/utils/api.js` to match your setup:
- Development: `http://192.168.X.X:5000/api`
- Production: `https://your-domain.com/api`
