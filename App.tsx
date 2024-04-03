import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import * as SplashScreen from 'expo-splash-screen';
import i18n from './src/utils/i18n';
import { Provider } from 'react-redux';
import { store } from './src/store/store';


import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from 'react-native-paper';


SplashScreen.preventAutoHideAsync();
setTimeout(() => {
  SplashScreen.hideAsync();
}, 1000);

const theme = {
  ...DefaultTheme,
  // Specify custom property
  myOwnProperty: true,
  // Specify custom property in nested object
  colors: {
    ...DefaultTheme.colors,
    primary: '#b5e1eb',
    accent: '#f0f9fc',
    background: '#fff'
  },
};

export default function App() {

  return (
    <Provider store={store}>
      <PaperProvider theme={theme}>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style="auto" />
        </NavigationContainer>
      </PaperProvider>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
