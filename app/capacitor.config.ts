import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myjourney.app',
  appName: 'My Journey',
  server: {
    url: 'https://my-journey-app.vercel.app',
    cleartext: false,
  },
  ios: {
    scheme: 'My Journey',
    contentInset: 'always',
  },
};

export default config;
