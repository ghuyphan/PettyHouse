import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator'; // Your navigation setup
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
  Snackbar,
  ActivityIndicator,
} from 'react-native-paper';
import pb from './src/services/pocketBase'; // Your PocketBase setup
import { checkInitialAuth } from './src/utils/authUtils';
import useNetworkStatus from './src/hooks/useNetworkStatus';
import { useTranslation } from 'react-i18next';
SplashScreen.preventAutoHideAsync().catch(/* ... */);

// Your theme definition
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#b5e1eb',
    primaryContainer: '#f0f9fc',
    accent: '#f0f9fc',
    background: '#fff',
    secondaryContainer: '#f0f9fc',
    elevation: {
      level0: '#f0f9fc',
      level1: '#f0f9fc',
      level2: '#f0f9fc',
      level3: '#f0f9fc',
      level4: '#f0f9fc',
      level5: '#f0f9fc',
    }
  },
};

export default function App() {
  const [isAppReady, setIsAppReady] = useState(false);
  const { snackBarVisible, onDismissSnackBar, dismissSnackBar } = useNetworkStatus();
  const { t } = useTranslation();

  useEffect(() => {
    const init = async () => {
      await checkInitialAuth();
      await SplashScreen.hideAsync();
      setIsAppReady(true);
    };

    init();
  }, []);

  if (!isAppReady) {
    return (
      <View style={styles.splashContainer}>
        <Image source={require('./assets/splash.png')} style={styles.splashImage} />
        <ActivityIndicator size="small" color="#8ac5db" style={{position: 'absolute', bottom: 100}} />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator initialRouteName={pb.authStore.isValid ? 'BottomNav' : 'Login'} />
          <StatusBar style="auto" />
        </NavigationContainer>
        <Snackbar
          visible={snackBarVisible}
          onDismiss={onDismissSnackBar}
          duration={1000000000000000}
          wrapperStyle={{ bottom: 20 }}
          action={{
            label: t('close'),
            labelStyle: { color: '#b5e1eb' },
            onPress: () => {
              dismissSnackBar();
            },
            rippleColor: '#b5e1eb',
          }}
        >
          {t('noInternet')}
        </Snackbar>
      </PaperProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#f0f9fc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashImage: {
    width: 410, // Adjust if needed
    height: 410, // Adjust if needed
  }
});
