import { createApp } from '../src/app';

export function buildApp() {
  return createApp({ mongoConnected: true });
}
