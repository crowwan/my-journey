import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.myjourney.app',
  appName: 'My Journey',
  backgroundColor: '#ffffff',
  server: {
    url: 'https://my-journey-planner.vercel.app',
    cleartext: false,
  },
  ios: {
    scheme: 'My Journey',
  },
};

export default config;
