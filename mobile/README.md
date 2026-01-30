# 🛍️ k-al Shopping App - Mobile (React Native + Expo)

A beautiful handmade products shopping app built with React Native and Expo.

## Features

- 🎨 Beautiful UI matching design screenshots
- 📱 Cross-platform (iOS/Android) with Expo Go
- 🔐 User authentication (Register/Login)
- 🛍️ Browse and search products
- 🏪 Create and manage your own store
- ❤️ Like and save favorite products
- 📦 Order management

## Installation

1. Install dependencies
```bash
npm install
```

2. Start the app
```bash
npm start
```

3. Scan QR code with Expo Go app

## Project Structure

```
src/
├── screens/     # UI screens
├── navigation/  # Route navigation
├── context/     # Auth context
└── utils/       # API calls
```

## Color Scheme
- Primary: #FF6B9D (Pink)
- Secondary: #4A4E69 
- Light: #F5F5F5

## API Connection

This app uses `src/utils/api.ts`.

- Set `EXPO_PUBLIC_API_URL` in a local `.env` file (recommended), or
- It will auto-guess your dev machine IP using Expo `hostUri`.

1. Create `.env` from `.env.example`
```powershell
Copy-Item .env.example .env
```

2. Set your backend API URL inside `.env`
```dotenv
EXPO_PUBLIC_API_URL=http://YOUR_IP:5000/api
```

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

Start developing by editing files in `src/`.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
"# mobile-shop" 
