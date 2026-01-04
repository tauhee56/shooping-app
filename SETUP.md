# 🚀 Complete Setup Guide

Follow these steps to get your k-al Shopping App running!

## ⚙️ Prerequisites

Before you start, make sure you have:
- **Node.js** v16+ (download from nodejs.org)
- **npm** (comes with Node.js)
- **MongoDB** (local or MongoDB Atlas cloud)
- **Expo CLI**: `npm install -g expo-cli`
- **Expo Go app**: Download from App Store or Google Play
- **Code Editor**: VS Code recommended

---

## 1️⃣ Backend Setup (Node.js/Express)

### Step 1: Navigate to backend folder
```bash
cd backend
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Create `.env` file
Create a new file named `.env` in the backend folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/shoppingapp
JWT_SECRET=your_secret_key_change_this_in_production
NODE_ENV=development
```

**Note**: If you don't have MongoDB locally, use MongoDB Atlas:
1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create a cluster
4. Get connection string
5. Replace `MONGODB_URI` with your connection string

### Step 4: Start the backend server
```bash
npm start
```

You should see:
```
✓ Server running on port 5000
✓ MongoDB connected
```

**Keep this terminal open!**

---

## 2️⃣ Mobile App Setup (React Native/Expo)

### Step 1: Open new terminal, navigate to mobile folder
```bash
cd mobile
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Get your machine's IP address

**Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your WiFi connection (e.g., 192.168.x.x)

**Mac/Linux:**
```bash
ifconfig getifaddr en0
```

### Step 4: Update API URL

Open `mobile/src/utils/api.js` and change:
```javascript
const API_URL = 'http://192.168.x.x:5000/api';  // Replace with your IP
```

### Step 5: Start Expo

```bash
npm start
```

You'll see a QR code in the terminal.

### Step 6: Open Expo Go

**On iPhone:**
1. Open Camera app
2. Point at QR code
3. Tap notification

**On Android:**
1. Open Expo Go app
2. Tap "Scan QR Code"
3. Point at QR code

**Wait for app to load** (first time takes 30-60 seconds)

---

## 3️⃣ Test the App

### Create an Account
1. Tap "Create Account" on login screen
2. Fill in details (use any email/password)
3. Tap "Create Account"

### Browse Products
1. Should see home feed with products
2. Tap on any product to see details
3. Try the "Add to Cart" button

### Create a Store
1. Go to Profile tab
2. Tap "Create Store"
3. Fill in store details
4. Tap "Create Store"

### Add Products
1. On Profile → "My Store"
2. Tap "Add Product"
3. Fill in product details
4. Tap "Add Product"

---

## 🔧 Troubleshooting

### Issue: "Cannot find backend server"

**Solution:**
1. Make sure backend is running in first terminal
2. Check your IP address is correct
3. Ensure phone and computer are on **same WiFi**
4. Check firewall isn't blocking port 5000

**Test:**
```bash
# On your phone, try to ping backend
# (Or just check if you can see the IP from your phone)
```

### Issue: "Module not found"

**Solution:**
```bash
# In mobile folder
rm -rf node_modules package-lock.json
npm install

# Then restart Expo
npm start -c
```

### Issue: "Cannot connect to MongoDB"

**Solution 1: Use Local MongoDB**
```bash
# Windows
mongod

# Mac (if installed via brew)
brew services start mongodb-community
```

**Solution 2: Use MongoDB Atlas Cloud**
- Update `MONGODB_URI` in backend `.env`
- No local setup needed

### Issue: "Blank white screen"

**Solution:**
1. Check browser console for errors
2. Check Expo terminal for errors
3. Try `npm start -c` to clear cache
4. Restart Expo

### Issue: "API calls failing"

**Check:**
1. Backend server is running (`npm start` in backend)
2. API URL is correct in `src/utils/api.js`
3. You're using your machine's IP, not "localhost"
4. Same WiFi network

---

## 📱 Using Expo Go

### Tips
- **Reload app**: Shake phone to open menu
- **Switch project**: Select project from home screen
- **View logs**: Select "View logs" from menu
- **Detach**: You can export standalone app later

### Hot Reload
- Changes to code auto-reload (if enabled)
- Save file and wait 2-3 seconds
- App updates on your phone

---

## 🛠️ Development Tips

### Edit Backend
- Make changes to files in `backend/` folder
- Server auto-restarts (if using nodemon)
- No need to restart mobile app

### Edit Mobile App
- Make changes to files in `mobile/src/` folder
- App auto-reloads (usually instant)
- No need to rebuild

### Add API Endpoint
1. Add controller in `backend/controllers/`
2. Add route in `backend/routes/`
3. Add API method in `mobile/src/utils/api.js`
4. Use in your screen component

### Add New Screen
1. Create file in `mobile/src/screens/`
2. Add navigation in `mobile/src/navigation/Navigation.js`
3. Import and use in your app

---

## 📦 Useful Commands

### Backend
```bash
npm start          # Start server
npm run dev        # Start with auto-reload (if nodemon installed)
```

### Mobile
```bash
npm start          # Start Expo
npm run android    # Build for Android
npm run ios        # Build for iOS
npm start -c       # Clear cache and restart
```

---

## ✅ Verification Checklist

Before considering setup complete:

- [ ] Backend running (`npm start` in backend)
- [ ] MongoDB connected (no errors in backend terminal)
- [ ] Mobile app running in Expo Go
- [ ] Can create user account
- [ ] Can see products on home screen
- [ ] Can view product details
- [ ] Can create store
- [ ] Can add products to store

If all checkboxes are ✅, you're ready to go!

---

## 🎉 Next Steps

1. **Customize Colors**: Edit `COLORS` in screens
2. **Add More Products**: Use "Add Product" screen
3. **Test Full Flow**: Create store → Add products → View on home
4. **Deploy**: When ready, deploy to Google Play/App Store

---

## 📞 Need Help?

1. **Check Logs**:
   - Backend: Look at terminal output
   - Mobile: Press `j` in Expo terminal for logs

2. **Common Issues**:
   - Network: Same WiFi? Correct IP?
   - Database: MongoDB running?
   - Modules: Try `npm install` again

3. **Debug Tips**:
   - Add `console.log()` statements
   - Check Network tab in browser DevTools
   - Look at API responses in Axios interceptors

---

## 🚀 You're All Set!

Congratulations! Your shopping app is now running locally. 

**Happy coding!** 🎨

Questions? Check the README files in backend/ and mobile/ folders for more details.
