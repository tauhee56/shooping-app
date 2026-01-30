# 🛍️ k-al Shopping App - Backend

Node.js/Express backend for the k-al handmade products shopping platform.

## Features

- **User Authentication**: Register, login, profile management
- **Product Management**: Browse, search, and filter products
- **Store Management**: Create and manage your own store
- **Order Management**: Create and track orders
- **Social Features**: Follow users and stores

## Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app factory
│   ├── server.ts              # Main server entrypoint
│   ├── modules/               # Feature modules (routes/controllers/services/validation)
│   ├── common/                # Shared HTTP + logging utilities
│   ├── middleware/            # notFound, errorHandler, etc.
│   └── config/                # env + db config
├── models/                    # Mongoose schemas (User, Product, Store, Order)
├── routes/                    # Legacy route re-exports (backward compatibility)
├── controllers/               # Legacy controllers (backward compatibility)
├── middleware/                # Legacy middleware re-exports (backward compatibility)
├── scripts/                   # Utility scripts (e.g. smoke test)
├── tests/                     # Jest + Supertest integration tests
├── package.json               # Dependencies + scripts
└── .env                       # Environment variables
```

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoppingapp
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

3. Make sure MongoDB is running locally or configure your remote MongoDB URI

4. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## Scripts

```bash
npm run build      # TypeScript build (dist/)
npm start          # Run built server (dist/src/server.js)
npm run dev        # Run built server with nodemon
npm test           # Jest + Supertest + mongodb-memory-server
npm run test:watch # Watch mode
npm run smoke:test # End-to-end API smoke test (requires server running)
```

## API Endpoints

### Auth Routes (`/api/auth`)
- `POST /register` - Register new user
- `POST /login` - Login user
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `POST /follow/:userId` - Follow user (protected)

### Product Routes (`/api/products`)
- `GET /` - Get all products with filters
- `GET /featured` - Get featured products
- `GET /:id` - Get product details
- `GET /store/:storeId` - Get products by store
- `POST /:id/like` - Like product (protected)

### Store Routes (`/api/stores`)
- `POST /` - Create store (protected)
- `GET /my` - Get user's store (protected)
- `GET /:id` - Get store details
- `PUT /:id` - Update store (protected)
- `POST /:id/products` - Add product to store (protected)
- `POST /:id/follow` - Follow store (protected)

### Order Routes (`/api/orders`)
- `POST /` - Create order (protected)
- `GET /` - Get user's orders (protected)
- `GET /:id` - Get order details (protected)
- `PUT /:id/status` - Update order status (protected)

## Database Models

### User
- name, email, password, phone
- profileImage, bio
- isStore, storeId
- followers, following

### Product
- name, description, price, originalPrice
- store (reference to Store)
- images, category, tags
- stock, rating, reviews
- ingredients, benefits, weight

### Store
- name, owner, description
- logo, banner, location
- followers, products
- rating, totalSales

### Order
- user, items, totalAmount
- deliveryAddress, status
- paymentMethod, paymentStatus

## Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are valid for 30 days.

## Database Setup

Ensure MongoDB is running:
```bash
# On Windows
mongod
```

Or use MongoDB Atlas cloud database by updating `MONGODB_URI` in `.env`

## Testing

Automated tests:

```bash
npm test
```

Notes:
- Tests run against an in-memory MongoDB instance (`mongodb-memory-server`).
- `JWT_SECRET` is set automatically for tests.

Manual testing:

Use Postman or any API testing tool with the provided endpoints.

Example login:
```
POST http://localhost:5000/api/auth/login
Body: {
  "email": "user@example.com",
  "password": "password"
}
```

## Error Handling

All endpoints return appropriate HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 404: Not Found
- 500: Server Error

## Logging

Requests are logged using structured logging. A request ID is attached/propagated via the `x-request-id` header.

## CI

GitHub Actions workflow runs for backend changes:
- Install (`npm ci`)
- Build (`npm run build`)
- Test (`npm test`)
