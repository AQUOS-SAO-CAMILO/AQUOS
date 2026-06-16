import type { CapacitorConfig } from '@capacitor/cli';

const localIp = process.env.LOCAL_IP;

const config: CapacitorConfig = {
  appId: 'com.aquos.app',
  appName: 'AQUOS',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      backgroundColor: '#ffffff'
    }
  },
  ...(localIp ? {
    server: {
      url: `http://${localIp}:5173`,
      cleartext: true,
      allowNavigation: [`${localIp}:5001`, `${localIp}:5173`]
    }
  } : {})
};

export default config;
