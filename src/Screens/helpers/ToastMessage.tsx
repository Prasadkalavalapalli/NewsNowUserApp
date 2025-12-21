// components/ToastMessage.jsx
import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { medium, semibold } from '../helpers/fonts';

const ToastMessage = ({ 
  message, 
  type = 'info', 
  duration = 3000,
  onClose 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-50)).current;

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return pallette.primary;
      case 'error':
        return pallette.red;
      case 'warning':
        return pallette.gold;
      case 'info':
      default:
        return pallette.l1;
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'circle-check';
      case 'error':
        return 'circle-xmark';
      case 'warning':
        return 'triangle-exclamation';
      case 'info':
      default:
        return 'circle-info';
    }
  };

  useEffect(() => {
    // Slide in and fade in
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after duration
    const timer = setTimeout(() => {
      dismissToast();
    }, duration);

    return () => clearTimeout(timer);
  }, []);

  const dismissToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  if (!message) return null;

  return (
    <Animated.View 
      style={[
        styles.container,
        { 
          backgroundColor: getBackgroundColor(),
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.content}>
        <Icon name={getIcon()} size={20} color={pallette.white} />
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity onPress={dismissToast} style={styles.closeButton}>
          <Icon name="xmark" size={16} color={pallette.white} />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 40,
    left: 20,
    right: 20,
    borderRadius: 12,
    padding: 16,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 9999,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    flex: 1,
    color: pallette.white,
    fontSize: 14,
    fontFamily: medium,
    marginLeft: 12,
    marginRight: 8,
  },
  closeButton: {
    padding: 4,
  },
});

export default ToastMessage;