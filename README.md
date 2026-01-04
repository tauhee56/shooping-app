# 🛍️ k-al Shopping App - Complete Platform

A modern handmade products e-commerce platform with React Native mobile app and Node.js/Express backend.

## 📦 Project Overview

This is a full-stack shopping platform featuring:
- **Mobile App**: React Native + Expo (cross-platform iOS/Android)
- **Backend API**: Node.js/Express with MongoDB
- **Real-time**: User authentication, store management, product catalog

## 🎨 Design Features

Built to match the exact design from screenshots:
- Beautiful pink (#FF6B9D) theme
- Smooth navigation and animations
- Product browsing with search and filters
- Store management system
- User profiles and following system
- Shopping cart and order management

## 🚀 Quick Start

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your MongoDB URI
cat > .env << EOF
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoppingapp
JWT_SECRET=your_jwt_secret_key_here_change_in_production
NODE_ENV=development
EOF

# Start server
npm start
# Server runs on http://localhost:5000
```

### Mobile App Setup

```bash
cd mobile

# Install dependencies
npm install

# Update API URL in src/utils/api.js with your backend IP
# Get your IP: ipconfig (Windows) or ifconfig (Mac/Linux)

# Start Expo
npm start

# Scan QR code with Expo Go app
```

## 📱 Mobile App Features

### Screens Implemented

1. **Authentication**
   - Login Screen
   - Register Screen
   - Persistent login with JWT

2. **Shopping**
   - Home/Feed Screen with featured products
   - Product Detail Screen with images and reviews
   - Search and filter functionality
   - Like/favorite products

3. **Store Management**
   - Create Store Screen
   - My Store Dashboard
   - Add Products to Store
   - Manage inventory

4. **User Profile**
   - Profile Screen with statistics
   - Follow/Follower system
   - Orders history
   - Account settings

### Navigation
- **Bottom Tab Navigation**: 5 main tabs (Home, Stories, Products, Cart, Profile)
- **Stack Navigation**: Deep linking between screens
- **Authentication Flow**: Auto-redirect based on login status

## 🔌 Backend API

### Available Endpoints

#### Authentication (`/api/auth`)
```
POST   /register           - Register new user
POST   /login              - User login
GET    /profile            - Get user profile (🔒)
PUT    /profile            - Update profile (🔒)
POST   /follow/:userId     - Follow user (🔒)
```

#### Products (`/api/products`)
```
GET    /                   - Get all products with filters
GET    /featured           - Get featured products
GET    /:id                - Get product details
GET    /store/:storeId     - Get products by store
POST   /:id/like           - Like product (🔒)
```

#### Stores (`/api/stores`)
```
POST   /                   - Create store (🔒)
GET    /my                 - Get user's store (🔒)
GET    /:id                - Get store details
PUT    /:id                - Update store (🔒)
POST   /:id/products       - Add product (🔒)
POST   /:id/follow         - Follow store (🔒)
```

#### Orders (`/api/orders`)
```
POST   /                   - Create order (🔒)
GET    /                   - Get user's orders (🔒)
GET    /:id                - Get order details (🔒)
PUT    /:id/status         - Update status (🔒)
```

🔒 = Requires authentication

## 📊 Database Models

### User
```javascript
{
  name, email, password, phone,
  profileImage, bio,
  isStore, storeId,
  followers[], following[]
}
```

### Product
```javascript
{
  name, description, price, originalPrice,
  store (reference),
  images[], category, tags[],
  stock, rating, reviews[],
  ingredients[], benefits[], weight,
  likes[]
}
```

### Store
```javascript
{
  name, owner (reference),
  description, logo, banner, location,
  followers[], products[],
  rating, totalSales
}
```

### Order
```javascript
{
  user (reference),
  items[], totalAmount,
  deliveryAddress,
  status, paymentMethod, paymentStatus
}
```

## 🛠️ Tech Stack

### Frontend (Mobile)
- React Native
- Expo CLI
- React Navigation
- Axios (HTTP client)
- AsyncStorage (local storage)
- Expo Icons (Material Icons)

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose (ODM)
- JWT (authentication)
- bcryptjs (password hashing)

### Languages
- JavaScript (frontend)
- JavaScript (backend)

## 🔐 Authentication

### Login Flow
1. User enters email/password
2. Backend validates and returns JWT token
3. Token stored in AsyncStorage on client
4. Token automatically included in all requests
5. Backend verifies token on protected routes

### Token Format
```
Header: Authorization: Bearer <jwt_token>
```

Tokens expire after 30 days.

## 📁 Project Structure

```
shoppingapp/
├── backend/
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   ├── middleware/         # Auth middleware
│   ├── server.js           # Entry point
│   ├── package.json
│   ├── .env               # Environment config
│   └── README.md
│
└── mobile/
    ├── src/
    │   ├── screens/       # UI screens
    │   ├── navigation/    # Navigation setup
    │   ├── context/       # Auth context
    │   ├── components/    # Reusable components
    │   └── utils/         # API client
    ├── App.js            # Root component
    ├── app.json          # Expo config
    ├── package.json
    └── README.md
```

## 🎯 Customization

### Change Colors
Edit color constants in screens:
```javascript
const COLORS = {
  primary: '#FF6B9D',      // Change primary color
  secondary: '#4A4E69',    // Change secondary
  // ... etc
};
```

### Change API Endpoint
Update `mobile/src/utils/api.js`:
```javascript
const API_URL = 'http://YOUR_BACKEND_URL:5000/api';
```

### Change App Name
Update `mobile/app.json`:
```json
{
  "expo": {
    "name": "Your App Name",
    "slug": "your-app-slug"
  }
}
```

## 🚨 Important Setup Notes

### Backend
1. **MongoDB**: Ensure it's running locally or use MongoDB Atlas
2. **JWT Secret**: Change `JWT_SECRET` in `.env` for production
3. **CORS**: Currently allows all origins - restrict for production

### Mobile
1. **API URL**: Use your machine's IP, not localhost
   - Get IP: `ipconfig getifaddr en0` (Mac) or `ipconfig` (Windows)
2. **Network**: Phone must be on same WiFi as development machine
3. **Firewall**: Allow port 5000 and 19000 (Expo) through firewall

## 📋 Features Checklist

- [x] Authentication (Register/Login)
- [x] Product browsing
- [x] Product details
- [x] Store creation
- [x] Store management
- [x] Product addition
- [x] User profiles
- [x] Following system
- [ ] Shopping cart (UI ready)
- [ ] Payment integration
- [ ] Order tracking
- [ ] Push notifications
- [ ] Image uploads (Cloudinary)
- [ ] Product reviews

## 🔄 Next Steps

1. **Connect to Real Database**: Update MongoDB URI in backend `.env`
2. **Image Upload**: Integrate Cloudinary for product images
3. **Payment**: Add Stripe/PayPal payment processing
4. **Notifications**: Implement push notifications
5. **Analytics**: Add user behavior tracking
6. **Performance**: Implement lazy loading and code splitting

## 📚 Resources

- [React Native Docs](https://reactnative.dev)
- [Expo Documentation](https://docs.expo.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Documentation](https://docs.mongodb.com)
- [React Navigation](https://reactnavigation.org)

## 🐛 Troubleshooting

### Expo Connection Issues
```bash
# Clear cache and restart
expo start -c

# Check network connectivity
ping YOUR_BACKEND_IP
```

### MongoDB Connection
```bash
# Check if MongoDB is running
mongosh  # or mongo in older versions
```

### Module Errors
```bash
# Clean reinstall
rm -rf node_modules package-lock.json
npm install
```

## 👨‍💻 Development

### Code Quality
- No linting configured yet - add ESLint for best practices
- No tests - add Jest/React Native Testing Library

### Performance
- Images use placeholders - optimize with actual image uploads
- Consider Redux for complex state management
- Implement pagination for product lists

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Support

For issues or questions:
1. Check the README in backend/ or mobile/ folders
2. Review API endpoints documentation
3. Check browser console (web) or Expo logs (mobile)

---

**Happy Coding! 🚀**

Built with ❤️ using React Native + Express.js
