import React, { useContext } from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAppContext } from '../Store/contexts/app-context';
import { pallette } from '../Screens/helpers/colors';
import { h, w } from '../constants/dimensions';
import { medium } from '../Screens/helpers/fonts';
import HelpScreen from '../Screens/help screens/help';
import AccountTabs from '../Screens/accounts/account';
import ReporterRegistration from '../Screens/Reporter Screens/ReporterRegister';
import NewsViewScreen from '../Screens/news screen/newsview';
import PrivacyPolicy from '../Screens/accounts/PrivacyPolicy';
import AboutNewsNow from '../Screens/accounts/AboutNewsNow';
import ProfileScreen from '../Screens/accounts/profile-screen';


// Define your strings (create a strings file or define here)
const strings = {
  ReporterHome: 'News',  
 UserProfile:'User Profile'
};




const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack Navigators for each tab

const ReporterHomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
     <Stack.Screen name="NewsViewScreen" component={NewsViewScreen} />
  </Stack.Navigator>
);
const UserProfile= () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="AccountTabs" component={AccountTabs} />
        <Stack.Screen name="ReporterRegistration" component={ReporterRegistration}/>
        <Stack.Screen name='PrivacyPolicy'component={PrivacyPolicy}/>
        <Stack.Screen name='AboutNewsNow'component={AboutNewsNow}/>
        <Stack.Screen name='ProfileScreen'component={ProfileScreen}/>
        <Stack.Screen name="HelpScreen" component={HelpScreen} />
  </Stack.Navigator>
);

// Main Tab Navigator
const TabNav = () => {
  const { user } = useAppContext();
const role = user?.role?.toLowerCase();
console.log(role);
  // Define tabs based on user role (example)
  const userTabs = [  
 
    {
      name: strings.ReporterHome,
      component: ReporterHomeStack,
      title: strings.ReporterHome,
      activeIcon: 'book-open-page-variant',
      inactiveIcon: 'book-open-page-variant-outline',
      show: true, // Show for all users
    },
      {
      name: strings.UserProfile,
      component: UserProfile,
      title: strings.UserProfile,
      activeIcon: 'account-circle',
      inactiveIcon: 'account-circle-outline',
      show: true, // Show for all users
    },
   
  ];

  // Filter tabs based on user role and visibility
  const filteredTabs = userTabs.filter(tab => tab.show);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: h * 0.08,
          elevation: 0,
          borderTopWidth: 0,
          backgroundColor: pallette.white,
        },
        tabBarHideOnKeyboard: true,
      }}
    >
      {filteredTabs.map((tab) => (
        <Tab.Screen
          key={tab.name}
          name={tab.name}
          component={tab.component}
          options={{
            unmountOnBlur: true,
            tabBarIcon: ({ focused }) => (
              <Icon
                name={focused ? tab.activeIcon : tab.inactiveIcon}
                size={26}
                color={focused ? pallette.primary : pallette.grey}
              />
            ),
            tabBarLabel: ({ focused }) => (
              <Text
                style={[
                  styles.label,
                  { color: focused ? pallette.primary : pallette.grey },
                ]}>
                {tab.title}
              </Text>
            ),
            tabBarButton: props => (
              <Pressable 
                {...props} 
                android_ripple={{ color: 'transparent' }} 
              />
            ),
          }}
        />
      ))}
    </Tab.Navigator>
  );
};

export default TabNav;

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontFamily: medium,
    marginBottom: 4,
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.white,
  },
  screenText: {
    fontSize: 20,
    fontFamily: medium,
    color: pallette.black,
  },
});