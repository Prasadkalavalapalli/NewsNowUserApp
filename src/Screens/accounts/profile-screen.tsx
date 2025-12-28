import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from "react-native-vector-icons/MaterialIcons";
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import Header from "../helpers/header";
import { useAppContext } from '../../Store/contexts/app-context';
import apiService from '../../Axios/Api';
import { adjust } from '../../constants/dimensions';
import { regular, semibold } from '../helpers/fonts';
import { pallette } from "../helpers/colors";
import Loader from '../helpers/loader';

// Input field component
interface InputProps {
  label: string;
  value: string;
  placeholder?: string;
  onValueChange: (val: string) => void;
  editable?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad';
  maxLength?: number;
}

const InputField: React.FC<InputProps> = ({
  label,
  value,
  placeholder,
  onValueChange,
  editable = true,
  keyboardType = 'default',
  maxLength,
}) => (
  <View style={styles.inputContainer}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      placeholder={placeholder || label}
      placeholderTextColor={pallette.grey}
      style={[styles.input, !editable && styles.disabledInput]}
      value={value}
      onChangeText={onValueChange}
      editable={editable}
      keyboardType={keyboardType}
      maxLength={maxLength}
      autoCapitalize="none"
      autoCorrect={false}
    />
  </View>
);

// Profile Screen Component (Edit only)
const ProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAppContext();
  
  // State
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    mobile: '',
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Fetch user details on mount
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    if (!user.userId) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User not found',
      });
      return;
    }
    
    try {
      setFetching(true);
      const response = await apiService.getUserById(user.userId);
      
      if (response.error === false) {
        const userData = response.data;
        setFormData({
          username: userData.name || '',
          email: userData.email || '',
          mobile: userData.mobileNumber 
            ? `${userData.mobileNumber}` 
            : userData.phone 
              ? `${userData.phone}` 
              : '',
        });
      } else {
        throw new Error(response.message || 'Failed to fetch profile');
      }
    } catch (error: any) {
      console.error('Fetch user error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to load profile',
      });
    } finally {
      setFetching(false);
    }
  };

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = (): string | null => {
    const { username, email, mobile } = formData;
    
    if (!username.trim() || username.length < 3) {
      return 'Please enter a valid name (min 3 characters)';
    }
    
    if (!email.trim() || !validateEmail(email)) {
      return 'Please enter a valid email address';
    }
    
    const cleanMobile = mobile.replace(/\D/g, '');
    if (mobile && cleanMobile.length < 10) {
      return 'Please enter a valid 10-digit mobile number';
    }
    
    return null;
  };

  // Handle profile update
  const handleUpdateProfile = async () => {
    const validationError = validateForm();
    if (validationError) {
      Toast.show({
        type: 'error',
        text1: 'Validation Error',
        text2: validationError,
      });
      return;
    }

    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'User ID not available',
      });
      return;
    }

    setLoading(true);
    try {
      // Format mobile number (remove +91 if present)
      const cleanMobile = formData.mobile.replace(/\D/g, '').slice(-10);
      
      const updateData = {
        userId: user.id,
        name: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        mobileNumber: cleanMobile || null,
      };

      // Call update profile API
      const response = await apiService.updateUserProfile(updateData);
      
      if (response.error === false) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: response.message || 'Profile updated successfully!',
        });
        
        // Navigate back after delay
        setTimeout(() => {
          navigation.goBack();
        }, 1500);
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (error: any) {
      console.error('Update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to update profile',
      });
    } finally {
      setLoading(false);h
    }
  };

  // Update form field
  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  // Handle back press
  const handleBackPress = () => {
    navigation.goBack();
  };

  if (fetching) {
    return (
      <Loader/>
    );
  }

  return (
    <ScrollView 
      style={styles.scrollView}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <Header
        onback={handleBackPress}
        hastitle={true}
        title={' Profile'}
        active={1}
        onSkip={() => {}}
        skippable={false}
      />
      
      <View style={styles.container}>
        {/* Profile Avatar */}
        <View style={styles.avatarContainer}>
          <Icon 
            name="account-circle" 
            size={100} 
            color={pallette.primary} 
          />
        </View>

        {/* Form Fields */}
        <InputField
          label="Name"
          value={formData.username}
          onValueChange={(val) => updateField('username', val)}
          placeholder="Enter your name"
          editable={false}
        />
        
        <InputField
          label="Email"
          value={formData.email}
          onValueChange={(val) => updateField('email', val)}
          placeholder="Enter your email"
          keyboardType="email-address"
          editable={false}
        />
        
        <InputField
          label="Mobile Number"
          value={formData.mobile}
          onValueChange={(val) => updateField('mobile', val)}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          maxLength={10}
          editable={false}
        />

        {/* Update Button */}
        {/* <TouchableOpacity
          style={[
            styles.submitButton,
            loading && styles.submitButtonDisabled
          ]}
          onPress={handleUpdateProfile}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={pallette.white} size="small" />
          ) : (
            <Text style={styles.submitButtonText}>
              Update Profile
            </Text>
          )}
        </TouchableOpacity> */}
      </View>
      
      <Toast position="top" visibilityTime={3000} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: pallette.white,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.white,
  },
  loadingText: {
    marginTop: 12,
    fontSize: adjust(14),
    color: pallette.grey,
    fontFamily: regular,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    color: pallette.black,
    fontSize: adjust(14),
    fontFamily: semibold,
    marginBottom: 8,
  },
  input: {
    height: 50,
    paddingHorizontal: 16,
    borderRadius: 12,
    color: pallette.black,
    fontSize: adjust(16),
    fontFamily: regular,
    borderWidth: 1,
    borderColor: pallette.lightgrey,
    backgroundColor: pallette.white,
  },
  disabledInput: {
    backgroundColor: pallette.lightgrey,
    color: pallette.grey,
  },
  submitButton: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: pallette.primary,
    marginTop: 20,
    elevation: 3,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  submitButtonDisabled: {
    backgroundColor: pallette.mediumgrey,
    opacity: 0.7,
  },
  submitButtonText: {
    color: pallette.white,
    fontSize: adjust(16),
    fontFamily: semibold,
  },
});

export default ProfileScreen;