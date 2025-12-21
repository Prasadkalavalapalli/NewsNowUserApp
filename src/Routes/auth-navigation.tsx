import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppContext } from '../Store/contexts/app-context';
import TabNav from './app-navigation';
import LoginScreen from '../Screens/login screens/login-screen';
import Splash from '../Screens/login screens/splash-screen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash after 3.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen for first 3.5 seconds
  if (showSplash) {
    return <Splash />;
  }

  // After splash, check authentication
  if (loading) {
    return <Splash />; // Or a loading indicator
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="MainTabs" component={TabNav} />
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;