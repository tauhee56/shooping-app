import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';
import { io } from 'socket.io-client';

let socket: any = null;

function getApiUrl(): string {
  const hostUri =
    (Constants.expoConfig as any)?.hostUri || (Constants as any)?.hostUri || '';
  const host = typeof hostUri === 'string' ? hostUri.split(':')[0] : '';
  return (
    process.env.EXPO_PUBLIC_API_URL ||
    (host ? `http://${host}:5000/api` : 'http://localhost:5000/api')
  );
}

function getSocketUrl(): string {
  const apiUrl = getApiUrl();
  return apiUrl.replace(/\/?api\/?$/, '');
}

export async function connectSocket() {
  try {
    const token = await AsyncStorage.getItem('authToken');
    if (!token) return null;

    if (!socket) {
      socket = io(getSocketUrl(), {
        transports: ['websocket'],
        autoConnect: false,
        auth: { token },
      });
    } else {
      socket.auth = { token };
    }

    if (!socket.connected) {
      socket.connect();
    }

    return socket;
  } catch {
    return null;
  }
}

export function getSocket() {
  return socket;
}
