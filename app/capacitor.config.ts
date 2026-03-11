import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myjourney.app',
  appName: 'My Journey',
  server: {
    url: 'https://my-journey-planner.vercel.app',
    cleartext: false,
  },
  ios: {
    scheme: 'My Journey',
    contentInset: 'always',
    backgroundColor: '#ffffff',
  },
};

export default config;
