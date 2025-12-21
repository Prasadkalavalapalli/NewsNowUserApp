// src/components/Header.tsx
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Platform,
  StatusBar,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import AccountTabs from '../accounts/account';
import HomeScreen from '../home screens/home';
import HelpScreen from '../help screens/help';

const { width: w, height: h } = Dimensions.get('window');

const MainHeader = () => {
  const navigation = useNavigation();

  const handleHelpPress = () => {
    navigation.navigate(HelpScreen);
  };

  const handleProfilePress = () => {
    navigation.navigate(AccountTabs);
  };

  const handleLogoPress = () => {
    navigation.navigate(HomeScreen);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Left Section: Logo with Brand Name */}
        <TouchableOpacity 
          style={styles.leftSection} 
          onPress={handleLogoPress}
          activeOpacity={0.7}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../../Asserts/newsfulllogo.png')}
              style={styles.logo}
            //   resizeMode="contain"
            />
            <View style={styles.brandContainer}>
              <Text style={styles.brandName}>NewsNow</Text>
              <Text style={styles.brandTagline}>Stay Informed</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Right Section: Help & Profile Icons */}
        <View style={styles.rightSection}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleHelpPress}
            activeOpacity={0.6}
          >
            <View style={styles.iconContainer}>
              <Icon name="help-outline" size={22} color={pallette.primary} />
              <Text style={styles.iconLabel}>Help</Text>
            </View>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.iconButton}
            onPress={handleProfilePress}
            activeOpacity={0.6}
          >
            <View style={styles.iconContainer}>
              <Icon name="account-circle" size={22} color={pallette.primary} />
              <Text style={styles.iconLabel}>Profile</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Optional: Bottom border with gradient effect */}
      <View style={styles.bottomBorder} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: pallette.white,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: h * 0.05,
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.05,
    borderBottomWidth: 0.5,
    borderBottomColor:pallette.grey,
    paddingBottom:5,
  },
  leftSection: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: w * 0.2,
    height: h * 0.05,
    borderRadius: 8,
    // shadowColor: pallette.primary,
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // // shadowRadius: 4,
    // elevation: 3,
  },
  brandContainer: {
    marginLeft: 12,
  },
  brandName: {
    fontSize: 22,
    fontFamily: bold,
    color: pallette.primary,
    letterSpacing: 0.5,
    fontWeight: '700',
    textShadowColor: 'rgba(0, 122, 255, 0.1)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  brandTagline: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.grey || '#666',
    marginTop: 2,
    letterSpacing: 0.3,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    marginLeft: 16,
  },
  iconContainer: {
    alignItems: 'center',
    padding: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    minWidth: 60,
  },
  iconLabel: {
    fontSize: 10,
    fontFamily: medium,
    color: pallette.primary,
    marginTop: 4,
    fontWeight: '500',
  },
  bottomBorder: {
    marginTop:4,
    height: 2,
    width: '100%',
    // backgroundColor: pallette.lightgrey,
  },
});

export default MainHeader;