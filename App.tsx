import React from 'react';
import { Provider } from 'react-redux';
import Toast from 'react-native-toast-message';
import { AppProvider } from './src/Store/contexts/app-context';
import AppNavigator from './src/Routes/auth-navigation';
import { store } from './src/Store/redux/store';
import { LocationProvider } from './src/Screens/location/LocationContext';

const App = () => {
  return (
    <Provider store={store}>
      <LocationProvider>
        <AppProvider>
          <AppNavigator />
          <Toast />
        </AppProvider>
      </LocationProvider>
    </Provider>
  );
};

export default App;
