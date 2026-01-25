// AdvertisementComponent.js
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
  Animated,
  Linking,
  Modal,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { medium, bold, semibold, regular } from '../helpers/fonts';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Sample Advertisement Data
const ADVERTISEMENTS = [
  // Type 1: Banner Ads
  {
    id: 1,
    type: 'banner',
    title: 'Breaking News Premium',
    description: 'Get ad-free experience with premium subscription',
    ctaText: 'Subscribe Now',
    linkUrl: 'https://yourapp.com/premium',
    imageUrl: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400',
    backgroundColor: pallette.l1,
    textColor: pallette.white,
    duration: 8000,
  },
  {
    id: 2,
    type: 'banner',
    title: 'Local Weather Updates',
    description: 'Get real-time weather alerts for your district',
    ctaText: 'Check Weather',
    linkUrl: 'https://yourapp.com/weather',
    imageUrl: 'https://images.unsplash.com/photo-1592210454359-9043f067919b?w-400',
    backgroundColor: pallette.l2,
    textColor: pallette.white,
    duration: 10000,
  },
  // Type 2: Text Only Ads
  {
    id: 3,
    type: 'text',
    title: 'Download Our App',
    description: 'Get notifications for breaking news in your area',
    ctaText: 'Download',
    linkUrl: 'https://play.google.com/store/apps',
    backgroundColor: pallette.primary,
    textColor: pallette.white,
    duration: 6000,
  },
  {
    id: 4,
    type: 'text',
    title: 'Follow Us on Social',
    description: 'Stay updated with latest news on Twitter',
    ctaText: 'Follow',
    linkUrl: 'https://twitter.com/yourapp',
    backgroundColor: pallette.l3,
    textColor: pallette.white,
    duration: 7000,
  },
  // Type 3: Promotional Ads
  {
    id: 5,
    type: 'promo',
    title: 'Limited Time Offer!',
    description: '50% off on yearly subscription',
    ctaText: 'Claim Offer',
    linkUrl: 'https://yourapp.com/offer',
    imageUrl: 'https://images.unsplash.com/photo-1607082350899-7e105aa886ae?w-400',
    backgroundColor: pallette.red,
    textColor: pallette.white,
    promoCode: 'NEWS50',
    duration: 12000,
  },
  // Type 4: Sponsored Content
  {
    id: 6,
    type: 'sponsored',
    title: 'Sponsored: Election Coverage',
    description: 'Live updates from polling stations',
    ctaText: 'Watch Live',
    linkUrl: 'https://yourapp.com/election',
    imageUrl: 'https://images.unsplash.com/photo-1540910419892-4a36d2c3266c?w-400',
    backgroundColor: pallette.l4,
    textColor: pallette.white,
    sponsor: 'Election Commission',
    duration: 15000,
  },
];

const AdvertisementComponent = ({
  position = 'bottom', // 'top', 'bottom', 'inline'
  frequency = 3, // Show ad after every X news items
  currentNewsIndex = 0,
  showCloseButton = true,
  onAdClicked,
  onAdClosed,
  onAdImpression,
  testMode = false,
}) => {
  const [currentAd, setCurrentAd] = useState(null);
  const [visible, setVisible] = useState(false);
  const [showFullScreen, setShowFullScreen] = useState(false);
  const [rotationIndex, setRotationIndex] = useState(0);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(position === 'top' ? -50 : 50)).current;

  // Rotate through ads
  useEffect(() => {
    if (currentNewsIndex > 0 && currentNewsIndex % frequency === 0) {
      const adIndex = rotationIndex % ADVERTISEMENTS.length;
      const ad = ADVERTISEMENTS[adIndex];
      setCurrentAd(ad);
      setRotationIndex(prev => prev + 1);
      
      // Track impression
      if (onAdImpression) {
        onAdImpression(ad);
      }
      
      // Show ad
      setTimeout(() => {
        setVisible(true);
        animateIn();
      }, 300);
    }
  }, [currentNewsIndex]);

  const animateIn = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateOut = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: position === 'top' ? -50 : 50,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setVisible(false);
      if (onAdClosed) onAdClosed(currentAd);
    });
  };

  const handleClose = () => {
    animateOut();
  };

  const handleAdPress = async () => {
    if (currentAd?.linkUrl) {
      if (onAdClicked) {
        onAdClicked(currentAd);
      }
      
      try {
        const canOpen = await Linking.canOpenURL(currentAd.linkUrl);
        if (canOpen) {
          await Linking.openURL(currentAd.linkUrl);
        }
      } catch (error) {
        console.error('Failed to open URL:', error);
      }
    }
  };

  const handleFullScreenPress = () => {
    setShowFullScreen(true);
  };

  const closeFullScreen = () => {
    setShowFullScreen(false);
  };

  // Auto close timer
  useEffect(() => {
    if (visible && currentAd?.duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, currentAd.duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, currentAd]);

  if (!visible || !currentAd) return null;

  // Render different ad types
  const renderAdContent = () => {
    switch (currentAd.type) {
      case 'banner':
        return (
          <TouchableOpacity
            style={[styles.adContainer, { backgroundColor: currentAd.backgroundColor }]}
            onPress={handleAdPress}
            activeOpacity={0.9}>
            {currentAd.imageUrl && (
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={styles.adImage}
                resizeMode="cover"
              />
            )}
            <View style={styles.adTextContainer}>
              <Text style={[styles.adTitle, { color: currentAd.textColor }]}>
                {currentAd.title}
              </Text>
              <Text style={[styles.adDescription, { color: currentAd.textColor }]}>
                {currentAd.description}
              </Text>
              <View style={styles.ctaRow}>
                <Text style={[styles.ctaText, { color: currentAd.textColor }]}>
                  {currentAd.ctaText}
                </Text>
                <Icon name="arrow-right" size={14} color={currentAd.textColor} />
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'text':
        return (
          <TouchableOpacity
            style={[styles.textAdContainer, { backgroundColor: currentAd.backgroundColor }]}
            onPress={handleAdPress}
            activeOpacity={0.9}>
            <View style={styles.textAdContent}>
              <Icon name="bullhorn" size={24} color={currentAd.textColor} style={styles.textAdIcon} />
              <View style={styles.textAdTextContainer}>
                <Text style={[styles.textAdTitle, { color: currentAd.textColor }]}>
                  {currentAd.title}
                </Text>
                <Text style={[styles.textAdDescription, { color: currentAd.textColor }]}>
                  {currentAd.description}
                </Text>
              </View>
              <Text style={[styles.textAdCta, { color: currentAd.textColor }]}>
                {currentAd.ctaText} →
              </Text>
            </View>
          </TouchableOpacity>
        );

      case 'promo':
        return (
          <TouchableOpacity
            style={[styles.promoAdContainer, { backgroundColor: currentAd.backgroundColor }]}
            onPress={handleAdPress}
            activeOpacity={0.9}>
            <View style={styles.promoBadge}>
              <Text style={styles.promoBadgeText}>PROMO</Text>
            </View>
            
            {currentAd.imageUrl && (
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={styles.promoImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.promoContent}>
              <Text style={[styles.promoTitle, { color: currentAd.textColor }]}>
                {currentAd.title}
              </Text>
              <Text style={[styles.promoDescription, { color: currentAd.textColor }]}>
                {currentAd.description}
              </Text>
              
              {currentAd.promoCode && (
                <View style={styles.promoCodeContainer}>
                  <Text style={[styles.promoCodeLabel, { color: currentAd.textColor }]}>
                    Use code:
                  </Text>
                  <Text style={styles.promoCode}>{currentAd.promoCode}</Text>
                </View>
              )}
              
              <View style={styles.promoCtaContainer}>
                <Text style={[styles.promoCtaText, { color: currentAd.textColor }]}>
                  {currentAd.ctaText}
                </Text>
                <Icon name="gift" size={16} color={currentAd.textColor} />
              </View>
            </View>
          </TouchableOpacity>
        );

      case 'sponsored':
        return (
          <TouchableOpacity
            style={[styles.sponsoredContainer, { backgroundColor: currentAd.backgroundColor }]}
            onPress={handleFullScreenPress}
            activeOpacity={0.9}>
            <View style={styles.sponsoredHeader}>
              <Icon name="handshake" size={16} color={currentAd.textColor} />
              <Text style={[styles.sponsoredLabel, { color: currentAd.textColor }]}>
                Sponsored Content
              </Text>
            </View>
            
            {currentAd.imageUrl && (
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={styles.sponsoredImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.sponsoredContent}>
              <Text style={[styles.sponsoredTitle, { color: currentAd.textColor }]}>
                {currentAd.title}
              </Text>
              <Text style={[styles.sponsoredDescription, { color: currentAd.textColor }]}>
                {currentAd.description}
              </Text>
              
              {currentAd.sponsor && (
                <Text style={[styles.sponsorName, { color: currentAd.textColor }]}>
                  By: {currentAd.sponsor}
                </Text>
              )}
              
              <View style={styles.sponsoredCtaRow}>
                <Text style={[styles.sponsoredCtaText, { color: currentAd.textColor }]}>
                  {currentAd.ctaText}
                </Text>
                <Icon name="external-link-alt" size={14} color={currentAd.textColor} />
              </View>
            </View>
          </TouchableOpacity>
        );

      default:
        return null;
    }
  };

  // Full Screen Ad Modal
  const renderFullScreenAd = () => {
    if (!showFullScreen || !currentAd) return null;

    return (
      <Modal
        visible={showFullScreen}
        transparent
        animationType="fade"
        onRequestClose={closeFullScreen}>
        <View style={styles.fullScreenOverlay}>
          <View style={styles.fullScreenContainer}>
            <TouchableOpacity style={styles.fullScreenCloseButton} onPress={closeFullScreen}>
              <Icon name="xmark" size={24} color={pallette.white} />
            </TouchableOpacity>
            
            {currentAd.imageUrl && (
              <Image
                source={{ uri: currentAd.imageUrl }}
                style={styles.fullScreenImage}
                resizeMode="cover"
              />
            )}
            
            <View style={styles.fullScreenContent}>
              <Text style={styles.fullScreenTitle}>{currentAd.title}</Text>
              <Text style={styles.fullScreenDescription}>{currentAd.description}</Text>
              
              {currentAd.sponsor && (
                <Text style={styles.fullScreenSponsor}>Sponsored by: {currentAd.sponsor}</Text>
              )}
              
              <TouchableOpacity style={styles.fullScreenCtaButton} onPress={handleAdPress}>
                <Text style={styles.fullScreenCtaButtonText}>{currentAd.ctaText}</Text>
                <Icon name="arrow-right" size={16} color={pallette.white} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <>
      <Animated.View
        style={[
          styles.container,
          position === 'top' ? styles.topPosition : 
          position === 'bottom' ? styles.bottomPosition : 
          styles.inlinePosition,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}>
        {showCloseButton && (
          <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
            <Icon name="xmark" size={14} color={pallette.white} />
          </TouchableOpacity>
        )}
        
        <View style={styles.adLabel}>
          <Text style={styles.adLabelText}>Advertisement</Text>
        </View>
        
        {renderAdContent()}
        
        {testMode && (
          <View style={styles.debugInfo}>
            <Text style={styles.debugText}>
              Ad #{currentAd.id} • {currentAd.type} • Auto-close in {Math.round((currentAd.duration || 0) / 1000)}s
            </Text>
          </View>
        )}
      </Animated.View>
      
      {renderFullScreenAd()}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    backgroundColor:pallette.white,
  },
  topPosition: {
    marginTop: 8,
  },
  bottomPosition: {
    marginBottom: 8,
  },
  inlinePosition: {
    marginVertical: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  adLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  adLabelText: {
    fontSize: 10,
    fontFamily: bold,
    color: pallette.white,
  },
  
  // Banner Ad Styles
  adContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    minHeight: 100,
  },
  adImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 16,
  },
  adTextContainer: {
    flex: 1,
  },
  adTitle: {
    fontSize: 16,
    fontFamily: bold,
    marginBottom: 4,
  },
  adDescription: {
    fontSize: 13,
    fontFamily: medium,
    marginBottom: 8,
    opacity: 0.9,
  },
  ctaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontSize: 14,
    fontFamily: semibold,
    marginRight: 6,
    textDecorationLine: 'underline',
  },
  
  // Text Ad Styles
  textAdContainer: {
    padding: 16,
    minHeight: 80,
  },
  textAdContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textAdIcon: {
    marginRight: 12,
  },
  textAdTextContainer: {
    flex: 1,
  },
  textAdTitle: {
    fontSize: 16,
    fontFamily: bold,
    marginBottom: 2,
  },
  textAdDescription: {
    fontSize: 13,
    fontFamily: medium,
    opacity: 0.9,
  },
  textAdCta: {
    fontSize: 14,
    fontFamily: semibold,
    marginLeft: 8,
  },
  
  // Promo Ad Styles
  promoAdContainer: {
    padding: 16,
    minHeight: 120,
  },
  promoBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: pallette.gold,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  promoBadgeText: {
    fontSize: 10,
    fontFamily: bold,
    color: pallette.black,
  },
  promoImage: {
    width: '100%',
    height: 60,
    borderRadius: 6,
    marginBottom: 12,
  },
  promoContent: {
    paddingHorizontal: 4,
  },
  promoTitle: {
    fontSize: 18,
    fontFamily: bold,
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 14,
    fontFamily: medium,
    marginBottom: 8,
    opacity: 0.9,
  },
  promoCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  promoCodeLabel: {
    fontSize: 13,
    fontFamily: medium,
    marginRight: 6,
  },
  promoCode: {
    fontSize: 14,
    fontFamily: bold,
    backgroundColor: pallette.white,
    color: pallette.black,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  promoCtaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promoCtaText: {
    fontSize: 15,
    fontFamily: semibold,
    marginRight: 6,
    textDecorationLine: 'underline',
  },
  
  // Sponsored Ad Styles
  sponsoredContainer: {
    padding: 16,
    minHeight: 140,
  },
  sponsoredHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sponsoredLabel: {
    fontSize: 12,
    fontFamily: medium,
    marginLeft: 6,
    opacity: 0.8,
  },
  sponsoredImage: {
    width: '100%',
    height: 80,
    borderRadius: 8,
    marginBottom: 12,
  },
  sponsoredContent: {
    paddingHorizontal: 4,
  },
  sponsoredTitle: {
    fontSize: 17,
    fontFamily: bold,
    marginBottom: 6,
  },
  sponsoredDescription: {
    fontSize: 14,
    fontFamily: medium,
    marginBottom: 8,
    opacity: 0.9,
  },
  sponsorName: {
    fontSize: 12,
    fontFamily: medium,
    fontStyle: 'italic',
    marginBottom: 10,
    opacity: 0.7,
  },
  sponsoredCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sponsoredCtaText: {
    fontSize: 14,
    fontFamily: semibold,
    marginRight: 6,
    textDecorationLine: 'underline',
  },
  
  // Full Screen Ad Styles
  fullScreenOverlay: {
    flex: 1,
    backgroundColor:pallette.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    backgroundColor: pallette.white,
    borderRadius: 16,
    overflow: 'hidden',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: 200,
  },
  fullScreenContent: {
    padding: 20,
  },
  fullScreenTitle: {
    fontSize: 22,
    fontFamily: bold,
    color: pallette.black,
    marginBottom: 10,
    textAlign: 'center',
  },
  fullScreenDescription: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.black,
    marginBottom: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  fullScreenSponsor: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: 20,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  fullScreenCtaButton: {
    backgroundColor: pallette.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  fullScreenCtaButtonText: {
    fontSize: 16,
    fontFamily: semibold,
    color: pallette.white,
    marginRight: 8,
  },
  
  // Debug Info
  debugInfo: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 4,
  },
  debugText: {
    fontSize: 10,
    fontFamily: regular,
    color: pallette.white,
    textAlign: 'center',
  },
});

export default AdvertisementComponent;