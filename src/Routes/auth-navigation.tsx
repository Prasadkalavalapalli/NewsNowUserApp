import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppContext } from '../Store/contexts/app-context';
import TabNav from './app-navigation';
import LoginScreen from '../Screens/login screens/login-screen';
import Splash from '../Screens/login screens/splash-screen';
import ReporterRegistration from '../Screens/Reporter Screens/ReporterRegister';
import RegisterScreen from '../Screens/accounts/RegisterScreen';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { isAuthenticated, loading } = useAppContext();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Show splash for minimum 1.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Show splash screen until minimum time AND loading completes
  if (showSplash || loading) {
    return <Splash />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          // User is logged in - show main tabs
          <Stack.Screen name="MainTabs" component={TabNav} />
        ) : (
          // User is not logged in - show auth screens
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="ReporterRegistration" component={ReporterRegistration} />
            <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;