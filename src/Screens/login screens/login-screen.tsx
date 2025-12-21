import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { pallette } from '../helpers/colors';
import { useAppContext } from '../../Store/contexts/app-context';

const LoginScreen = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAppContext();
  
  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username and password');
      return;
    }

    setLoading(true);
    
    // Mock login - replace with your API call
    const success = await login({
      id: '1',
      name: 'Admin User',
      email: 'admin@example.com',
      role: 'admin', // Change based on user type
    });

    setLoading(false);
    
    if (!success) {
      Alert.alert('Login Failed', 'Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>News App</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />
        
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Login'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.white,
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: pallette.primary,
    marginBottom: 50,
  },
  inputContainer: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    backgroundColor: pallette.white,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    fontSize: 16,
  },
  loginButton: {
    backgroundColor: pallette.primary,
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: pallette.white,
    fontSize: 18,
    fontWeight: '600',
  },
});

export default LoginScreen;