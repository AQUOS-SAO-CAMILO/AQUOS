import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.aquos.app',
  appName: 'AQUOS',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#ffffff'
    }
  },

  server: {
    cleartext: true,
    allowNavigation: ['192.168.15.8:5001']
  }
};

export default config;