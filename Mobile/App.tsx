import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFonts } from 'expo-font';
import { Asset } from 'expo-asset';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { LocationSelectionProvider } from './src/context/LocationSelectionContext';
import { ServiceRequestProvider } from './src/context/ServiceRequestContext';
import RootNavigator from './src/navigation/RootNavigator';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [assetsReady, setAssetsReady] = useState(false);
  const [fontsLoaded, fontError] = useFonts({
    Beckan: require('./assets/fonts/beckan.otf'),
    SilverGarden: require('./assets/fonts/silver-garden.otf'),
  });

  useEffect(() => {
    Asset.loadAsync([require('./assets/welcome-hero.png')])
      .then(() => setAssetsReady(true))
      .catch(() => setAssetsReady(true));
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && assetsReady) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, assetsReady]);

  if ((!fontsLoaded && !fontError) || !assetsReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <LocationSelectionProvider>
            <ServiceRequestProvider>
              <StatusBar style="light" />
              <RootNavigator />
            </ServiceRequestProvider>
          </LocationSelectionProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
