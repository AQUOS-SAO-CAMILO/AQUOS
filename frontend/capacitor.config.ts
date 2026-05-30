import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aquos.app',
  appName: 'AQUOS',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#ffffff'
    }
  }
};

export default config;