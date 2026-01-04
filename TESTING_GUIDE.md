# Shopping App - End-to-End Testing Guide

## 🚀 Quick Start

### Prerequisites
- Backend running on `http://192.168.100.209:5000`
- Frontend dev server running on `exp://192.168.100.209:8081`
- MongoDB running (or use MongoDB Atlas with connection string in `.env`)
- Expo Go app on your phone/emulator

### Start Services

**Backend Terminal:**
```powershell
cd c:\Projects\shoppingapp\backend
npm start
```

**Frontend Terminal:**
```powershell
cd c:\Projects\shoppingapp\mobile
npm run start
```

Then scan the QR code with Expo Go on your device.

---

## 🧪 Test Scenarios

### 1️⃣ **Auth Flow** (Most Critical)

#### 1a. Register New User
1. Open the app → you should see **WelcomeAuthScreen**
2. Tap **"Sign up"** button
3. Fill in:
   - Full Name: `Test User`
   - Email: `test@example.com`
   - Phone: `03001234567`
   - Password: `password123`
   - Confirm Password: `password123`
4. Tap **"Create Account"**
5. ✅ If successful: Should navigate to app (HomeStack with tabs)
6. ❌ If failed: Check error message and backend logs

#### 1b. Login with Registered User
1. From WelcomeAuthScreen → Tap **"Login"**
2. Should navigate to **LoginOptionsAuthScreen**
3. Tap any login option (Phone/Email/Username) → all go to **LoginScreen**
4. Enter email & password from step 1a
5. Tap **"Sign In"**
6. ✅ If successful: Should enter app directly to HomeStack
7. ❌ If failed: Check error message

#### 1c. Logout & Re-login
1. In Profile tab → scroll down and find **"Logout"** button (if visible)
2. Tap Logout
3. Should return to WelcomeAuthScreen
4. Login again → should work as in 1b
5. ✅ Token should persist in AsyncStorage between sessions

**Backend Validation:**
```bash
# Check user was created in MongoDB:
db.users.findOne({ email: 'test@example.com' })

# Verify JWT_SECRET is set:
echo $env:JWT_SECRET  # or check .env
```

---

### 2️⃣ **Store Management** (MyStore Edit/Delete)

#### 2a. Create Store
1. In Profile tab → tap **"Create Store"** (or "Become a Seller")
2. Fill in store details and submit
3. ✅ Navigate to **MyStoreScreen** showing your store

#### 2b. Edit Store
1. In MyStore → tap edit icon/button on store card
2. Modify store name/description
3. Tap **"Save Changes"**
4. ✅ Backend should call `PUT /api/stores/{storeId}`
5. ✅ Store should update and return to MyStore

#### 2c. Add Product
1. In MyStore → tap **"Add Product"**
2. Fill in product details (name, price, image URL, etc.)
3. Tap **"List Product"**
4. ✅ Product appears in store list
5. Backend: `POST /api/stores/{storeId}/products`

#### 2d. Edit Product
1. In MyStore → tap edit icon on a product
2. Navigate to **EditProductScreen**
3. Modify details → tap **"Save Changes"**
4. ✅ Backend: `PUT /api/stores/{storeId}/products/{productId}`

#### 2e. Delete Product
1. In MyStore → tap delete icon/button on a product
2. Confirm deletion in alert
3. ✅ Product removed from list
4. Backend: `DELETE /api/stores/{storeId}/products/{productId}`

---

### 3️⃣ **Messaging System** (Inbox/Chat)

#### 3a. Send Message
1. Navigate to **Inbox** tab
2. Should show **"No conversations"** initially (or existing ones)
3. Tap **"Start a Conversation"** (if available) or find a chat
4. In **ChatDetailScreen**: Type a message in the text input
5. Tap send button (arrow/send icon)
6. ✅ Message appears in chat (from current user)
7. Backend: `POST /api/messages` with `{ receiverId, content }`

#### 3b. Load Conversations
1. In Inbox tab
2. App calls `GET /api/messages/conversations`
3. ✅ Lists all chat partners (if any messages exist)
4. Tap a conversation → should load **ChatDetailScreen**

#### 3c. Load Message History
1. In ChatDetailScreen → should fetch messages with selected user
2. Backend: `GET /api/messages/{userId}`
3. ✅ Messages load and display
4. Scroll up to see earlier messages

---

### 4️⃣ **Checkout & Orders**

#### 4a. Browse Products
1. In Home tab → see product list
2. Tap a product → **ProductDetailScreen**
3. ✅ Should show product details and "Add to Cart" button

#### 4b. Add to Cart & Checkout
1. Tap **"Add to Cart"** on product
2. Navigate to Cart (via tab or navigation)
3. Tap **"Proceed to Checkout"**
4. Select/add address → **AddressesScreen**
5. Add a new address if needed → **AddAddressScreen**
6. Return to checkout, select payment method
7. Tap **"Place Order"**
8. ✅ Backend: `POST /api/orders` with items, address, payment method
9. ✅ Navigate to **OrderSuccessScreen**

#### 4c. View Orders
1. In Profile tab → tap **"Orders"** or **"My Purchases"**
2. ✅ Should show **OrdersScreen** with past orders (if any)
3. Tap an order → **OrderDetailScreen** with details

---

### 5️⃣ **Favorites System**

#### 5a. Like/Unlike Product
1. On **HomeScreen** or **ProductDetailScreen** → tap heart icon
2. ✅ Heart fills (indicating liked)
3. Tap again → heart unfills
4. Context: uses `FavoritesContext` (not persisted to backend)

#### 5b. View Favorites
1. In Profile tab → tap **"Favorites"** or **"Liked Items"**
2. ✅ Should show **FavoritesScreen** with liked products

---

## 🔍 Validation Checklist

### Frontend
- [ ] App boots and shows loading screen briefly
- [ ] Auth gating works: logged-out → AuthStack, logged-in → AppStack
- [ ] Token persists after app restart (check AsyncStorage)
- [ ] All screens load without crashing
- [ ] Navigation flows work (see NAVIGATION_FLOW below)
- [ ] Error messages display on failed API calls
- [ ] Loading states show during async operations

### Backend
- [ ] Server running on port 5000
- [ ] Routes registered:
  - `/api/auth` (register, login, profile)
  - `/api/products` (list, detail)
  - `/api/stores` (CRUD with products)
  - `/api/orders` (create, list, detail)
  - `/api/messages` (send, conversations, history)
- [ ] MongoDB connected (or error logged clearly)
- [ ] JWT tokens signed and verified correctly
- [ ] CORS enabled for frontend origin

### Database (MongoDB)
- [ ] Users table has registered account
- [ ] Stores table has created store (if tested)
- [ ] Products table linked to store
- [ ] Messages table has sent messages
- [ ] Orders table has placed orders

---

## 🗺️ Navigation Flow (Reference)

```
AuthStack (logged out):
  WelcomeAuth → [Login → LoginScreen | SignUp → RegisterScreen]
    └─ LoginOptionsAuth → Login/Email/Username all → LoginScreen

AppStack (logged in):
  Home (HomeStack)
    └─ ProductDetail → StoreDetail → StoreProducts
    └─ Checkout → Addresses → PaymentMethods → OrderSuccess
  
  Search (SearchScreen)
  
  Sell (SellScreen)
    └─ CreateStore → MyStore → [EditStore | AddProduct | EditProduct]
  
  Inbox (InboxStack)
    └─ ChatDetail
  
  Profile (ProfileStack)
    └─ Orders → OrderDetail
    └─ Favorites
    └─ Settings
    └─ Notifications
```

---

## 🐛 Troubleshooting

### "Cannot connect to backend"
- **Check:** Is backend running? `npm start` in backend directory
- **Check:** Is API_URL correct in `mobile/src/utils/api.js`? Should be `http://192.168.100.209:5000/api` (your IP)
- **Check:** Is device on same network as backend machine?
- **Fix:** Update API_URL and reload app

### "Registered but won't login"
- **Check:** Is MongoDB running or connection string valid in `.env`?
- **Check:** Backend logs for errors during register/login
- **Fix:** Restart backend, check MongoDB connection

### "Auth screen loops forever"
- **Check:** Is `AuthContext` hydrating token correctly?
- **Check:** AsyncStorage might be returning null after logout
- **Fix:** Clear app cache and re-register

### "API requests fail with 401"
- **Check:** Token is set in AsyncStorage: `await AsyncStorage.getItem('authToken')`
- **Check:** Token is being sent in Authorization header (check axios interceptor)
- **Check:** JWT_SECRET in backend matches token encoding
- **Fix:** Re-login to get fresh token

### "Messages don't load or send"
- **Check:** messageAPI endpoints exist and are registered in backend
- **Check:** Both users exist in database
- **Fix:** Verify `/api/messages/conversations` and `POST /api/messages` routes

---

## 📝 Quick Commands

**View Backend Logs:**
```powershell
# Terminal where backend is running
# Logs should print console messages from handlers
```

**Check API Health:**
```powershell
Invoke-WebRequest -Uri "http://192.168.100.209:5000/api/health"
```

**Reset Frontend (clear cache):**
```powershell
cd c:\Projects\shoppingapp\mobile
npx expo start --clear
```

**Restart Backend:**
```powershell
cd c:\Projects\shoppingapp\backend
npm start
```

---

## ✅ Success Criteria

- ✅ Register → token saved → auto-login on restart
- ✅ Login → app loads without errors
- ✅ Store edit → backend updates and frontend reflects change
- ✅ Message send → message appears in chat
- ✅ Create order → order saved and success screen shown
- ✅ Logout → returns to auth screen, token cleared
- ✅ All screens render without crashes
