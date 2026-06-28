export default {
  expo: {
    name: 'Cheezy',
    slug: 'cheezy',
    version: '1.0.0',
    orientation: 'portrait',
    scheme: 'cheezy',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#FFF8E7',
    },
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'com.tomvanhees.cheezy',
    },
    android: {
      package: 'com.tomvanhees.cheezy',
      versionCode: 1,
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON ?? './google-services.json',
      adaptiveIcon: {
        foregroundImage: './assets/android-icon-foreground.png',
        backgroundImage: './assets/android-icon-background.png',
        monochromeImage: './assets/android-icon-monochrome.png',
      },
      permissions: ['android.permission.RECORD_AUDIO'],
    },
    plugins: [
      'expo-router',
      'expo-font',
      '@react-native-google-signin/google-signin',
      [
        'expo-notifications',
        {
          icon: './assets/android-icon-monochrome.png',
          color: '#F6A623',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Cheezy heeft toegang tot je foto\'s nodig om kaasfotos toe te voegen.',
          cameraPermission:
            'Cheezy heeft toegang tot je camera nodig om een foto te maken van de kaas.',
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      router: {},
      eas: {
        projectId: '981a34aa-bf6f-444e-ae0c-f51da8ee9e86',
      },
    },
    owner: 'tomvanhees',
  },
};
