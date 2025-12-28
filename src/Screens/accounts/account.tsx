import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Ionicons from 'react-native-vector-icons/Ionicons';
import FontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

import Icon from "react-native-vector-icons/MaterialIcons";
import Header from "../helpers/header";
import { useAppContext } from "../../Store/contexts/app-context";
import { logoutUser } from "../../Store/redux/AuthSlice";
import { pallette } from "../helpers/colors";
import apiService from '../../Axios/Api';
import LoginScreen from "../login screens/login-screen";

/**
 * Account Tabs Component
 * 
 * Displays user account information and navigation menu
 */
const AccountTabs: React.FC = () => {
  const navigation = useNavigation();
  const { user, logout } = useAppContext();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Fetch user details on component mount
   */
  useEffect(() => {
    fetchUserDetails();
  }, []);

  const fetchUserDetails = async () => {
    try {
      if (!user.userId) return;
      
      const response = await apiService.getUserById(user.userId);
      
      if (response.error === false) {
        setUserData(response.data);
      } else {
        console.error('Failed to fetch user details:', response.message);
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Navigation menu items configuration
   */
  const menuItems = [
    { 
      id: "1", 
      title: "Reporters", 
      icon: "users", 
      onPress: () => navigation.navigate('ReporterList'),
      show: user?.role?.toLowerCase() === 'admin'
    },
    { 
      id: "2", 
      title: "Help Center", 
      icon: "headset", 
      onPress: () => navigation.navigate('HelpScreen'),
      show: true
    },
    { 
      id: "3", 
      title: "Privacy Policy", 
      icon: "clipboard-list", 
      onPress: () => navigation.navigate('PrivacyPolicy'),
      show: true
    },
    { 
      id: "4", 
      title: "About NewsNow", 
      icon: "info-circle", 
      onPress: () => navigation.navigate('AboutNewsNow'),
      show: true
    },
  ];

  /**
   * Handle user logout process
   */
  const handleLogout = async () => {
    try {
      // Clear AsyncStorage if needed
      // await AsyncStorage.clear();
      
      // Call context logout
      logout();
      
      // Dispatch Redux logout if using Redux
      // dispatch(logoutUser());
      
      // Navigate to login
      navigation.navigate(LoginScreen);
      
    } catch (error) {
      console.error('Logout error:', error);
      // Still navigate to login even if error
      navigation.navigate(LoginScreen);
    }
  };

  /**
   * Get display data for user profile section
   */
  const getDisplayData = () => {
    if (loading) {
      return { username: "Loading...", phoneNumber: "" };
    }
    
    if (userData) {
      return {
        username: userData.name || userData.username || "Guest User",
        phoneNumber: userData.mobileNumber || userData.phone || ""
      };
    }
    
    return { username: "Guest User", phoneNumber: "" };
  };

  const { username, phoneNumber } = getDisplayData();

  return (
    <View style={styles.container}>
      <Header 
        title="Account"
        onback={() => navigation.goBack()}
        hastitle={true}
        active={1}
        onSkip={() => {}}
        skippable={false}
      />
      
      {/* Profile Section */}
      <TouchableOpacity 
        style={styles.profileSection} 
        onPress={() => navigation.navigate('ProfileScreen')}
        activeOpacity={0.7}
      >
        <View style={styles.profileImage}>
          <Icon 
            name="account-circle" 
            size={70} 
            color={pallette.primary} 
          />
        </View>
        
        <View style={styles.profileInfo}>
          <Text style={styles.userName} numberOfLines={1}>
            {username}
          </Text>
          <Text style={styles.phoneNumber} numberOfLines={1}>
            {phoneNumber ? `+91 ${phoneNumber}` : "No phone number"}
          </Text>
        </View>
        
        <Ionicons name="chevron-forward" size={20} color="#999" />
      </TouchableOpacity>

      {/* Navigation Menu List */}
      <View style={styles.menuList}>
        {menuItems
          .filter(item => item.show)
          .map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem} 
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <FontAwesome5 
                name={item.icon} 
                size={18} 
                color={pallette.primary}
                style={styles.menuIcon} 
              />
              <Text style={styles.menuText}>{item.title}</Text>
              <Ionicons name="chevron-forward" size={18} color="#999" />
            </TouchableOpacity>
          ))
        }
      </View>

      {/* Logout Button */}
      <TouchableOpacity 
        onPress={handleLogout} 
        style={styles.logoutButton}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color={pallette.red} />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.white,
    paddingTop:20,
    paddingHorizontal:10
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: pallette.white,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  profileImage: {
    marginRight: 12,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: "600",
    color: pallette.black,
    marginBottom: 4,
  },
  phoneNumber: {
    fontSize: 14,
    color: pallette.grey,
  },
  menuList: {
    paddingVertical: 8,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  menuIcon: {
    width: 24,
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: pallette.black,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: pallette.lightred,
    marginHorizontal: 20,
    marginTop: 'auto',  // This pushes it to the bottom
    marginBottom: 30,   // Add some space from bottom
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: "600",
    color: pallette.red,
  },
});

export default AccountTabs;