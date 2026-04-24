/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { useEffect } from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { WIPE_STORAGE_ON_LAUNCH } from './src/auth/devAuth';
import { clearAllShopivaStorage } from './src/auth/session';
import NavigationHandler from './src/navigations/index';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    if (WIPE_STORAGE_ON_LAUNCH) {
      void clearAllShopivaStorage();
    }
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
        <NavigationHandler />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}


export default App;
