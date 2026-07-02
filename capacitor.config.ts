import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.coderecap.app',
  appName: 'CodeRecap AI',
  webDir: 'dist',
  server: {
    url: 'https://coderecap.onrender.com',
    cleartext: true
  }
};

export default config;