import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  StatusBar,
  Linking,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import { userAPI } from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';


const ReporterDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
//   const { reporterId } = route.params;
// console.log(reporterId);
const reporterId=1;
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reporter, setReporter] = useState(null);
  const [stats, setStats] = useState({
    totalNews: 0,
    pendingNews: 0,
    verifiedNews: 0,
    rejectedNews: 0,
  });
  const [toast, setToast] = useState(null);

  // Fetch reporter details
  const fetchReporterDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch reporter details
      const reporterResponse = await userAPI.getReporterDetails(reporterId);
      
      if (reporterResponse.success) {
        setReporter(reporterResponse.data);
        
        // Fetch reporter stats
        const statsResponse = await userAPI.getReporterStats(reporterId);
        if (statsResponse.success) {
          setStats(statsResponse.data);
        }
      } else {
        throw new Error(reporterResponse.message || 'Failed to fetch reporter details');
      }
    } catch (error) {
      console.error('Fetch reporter details error:', error);
      setToast({
        message: error.message || 'Failed to load reporter details',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (reporterId) {
      fetchReporterDetails();
    }
  }, [reporterId]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReporterDetails();
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleCallPress = () => {
    if (reporter?.phone) {
      Alert.alert(
        'Call Reporter',
        `Do you want to call ${reporter.phone}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call',
            onPress: () => {
              const phoneUrl = `tel:${reporter.phone}`;
              Linking.openURL(phoneUrl).catch(() => {
                setToast({
                  message: 'Unable to make phone call',
                  type: 'error'
                });
              });
            },
          },
        ]
      );
    }
  };

  const handleEmailPress = () => {
    if (reporter?.email) {
      const emailUrl = `mailto:${reporter.email}`;
      Linking.openURL(emailUrl).catch(() => {
        setToast({
          message: 'Unable to open email',
          type: 'error'
        });
      });
    }
  };

  const handleRemoveReporter = () => {
    Alert.alert(
      'Remove Reporter',
      'Are you sure you want to remove this reporter? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await userAPI.deleteReporter(reporterId);
              
              if (response.success) {
                setToast({
                  message: 'Reporter removed successfully',
                  type: 'success'
                });
                setTimeout(() => {
                  navigation.goBack();
                }, 1500);
              } else {
                throw new Error(response.message || 'Failed to remove reporter');
              }
            } catch (error) {
              setToast({
                message: error.message || 'Failed to remove reporter',
                type: 'error'
              });
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleViewNewsByStatus = (status) => {
    navigation.navigate('NewsList', { 
      reporterId,
      status,
      reporterName: reporter?.name 
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return pallette.primary;
      case 'pending': return pallette.gold;
      case 'suspended': return pallette.red;
      default: return pallette.grey;
    }
  };

  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  if (loading && !refreshing) {
    return (
      <Loader/>
    );
  }

  if (!reporter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress} style={styles.backButton}>
            <Icon name="arrow-left" size={adjust(20)} color={pallette.black} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reporter Details</Text>
        </View>
        <View style={styles.centerContainer}>
          <Icon name="user-slash" size={adjust(60)} color={pallette.lightgrey} />
          <Text style={styles.emptyText}>Reporter not found</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={handleBackPress}
          >
            <Text style={styles.goBackText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      {/* Toast Message */}
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
  <Header
        onback={() => navigation.goBack()}
        active={1}
        onSkip={() => {}}
        skippable={false}
        hastitle={true}
        title={'Reporter Details'}
      />

     

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[pallette.primary]}
            tintColor={pallette.primary}
          />
        }
      >
        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {reporter.name?.charAt(0)?.toUpperCase() || 'R'}
              </Text>
            </View>
            <View style={styles.statusBadge}>
              <View style={[styles.statusDot, { backgroundColor: getStatusColor(reporter.status) }]} />
              <Text style={styles.statusText}>{getStatusText(reporter.status)}</Text>
            </View>
          </View>
          
          <Text style={styles.reporterName}>{reporter.name}</Text>
          <Text style={styles.reporterId}>Reporter ID: {reporter.reporterId || reporter._id?.substring(0, 8)}</Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleCallPress}
              disabled={!reporter.phone}
            >
              <Icon name="phone" size={16} color={pallette.white} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.contactButton}
              onPress={handleEmailPress}
              disabled={!reporter.email}
            >
              <Icon name="envelope" size={16} color={pallette.white} />
              <Text style={styles.contactButtonText}>Email</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Contact Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Details</Text>
          
          <View style={styles.detailItem}>
            <Icon name="phone" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Phone:</Text>
            <Text style={styles.detailValue}>{reporter.phone || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="envelope" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Email:</Text>
            <Text style={styles.detailValue}>{reporter.email || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="location-dot" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>
              {reporter.address || 'Not provided'}
              {reporter.city && `, ${reporter.city}`}
              {reporter.state && `, ${reporter.state}`}
              {reporter.pincode && ` - ${reporter.pincode}`}
            </Text>
          </View>
        </View>

        {/* Identification Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          
          <View style={styles.detailItem}>
            <Icon name="id-card" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>ID Proof:</Text>
            <Text style={styles.detailValue}>
              {reporter.idProofType ? `${reporter.idProofType.toUpperCase()}: ` : ''}
              {reporter.idProofNumber || 'Not provided'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Joined:</Text>
            <Text style={styles.detailValue}>{formatDate(reporter.createdAt)}</Text>
          </View>
          
          {reporter.experience && (
            <View style={styles.detailItem}>
              <Icon name="briefcase" size={16} color={pallette.grey} />
              <Text style={styles.detailLabel}>Experience:</Text>
              <Text style={styles.detailValue}>{reporter.experience} years</Text>
            </View>
          )}
        </View>

        {/* News Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>News Statistics</Text>
          
          <View style={styles.statsGrid}>
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => handleViewNewsByStatus('all')}
            >
              <Text style={styles.statNumber}>{stats.totalNews}</Text>
              <Text style={styles.statLabel}>Total News</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => handleViewNewsByStatus('pending')}
            >
              <Text style={[styles.statNumber, { color: pallette.gold }]}>{stats.pendingNews}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => handleViewNewsByStatus('verified')}
            >
              <Text style={[styles.statNumber, { color: pallette.primary }]}>{stats.verifiedNews}</Text>
              <Text style={styles.statLabel}>Verified</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.statCard}
              onPress={() => handleViewNewsByStatus('rejected')}
            >
              <Text style={[styles.statNumber, { color: pallette.red }]}>{stats.rejectedNews}</Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Remove Reporter Button */}
        <TouchableOpacity 
          style={styles.removeButton}
          onPress={handleRemoveReporter}
          disabled={loading}
        >
          <Icon name="trash" size={18} color={pallette.white} />
          <Text style={styles.removeButtonText}>Remove Reporter</Text>
        </TouchableOpacity>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop:20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
  },
  headerRight: {
    width: 28,
  },
  scrollView: {
    flex: 1,
  },
  profileSection: {
    backgroundColor: pallette.white,
    alignItems: 'center',
    paddingVertical: h * 0.03,
    marginBottom: h * 0.02,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: h * 0.02,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: h * 0.01,
  },
  avatarText: {
    color: pallette.white,
    fontSize: adjust(40),
    fontFamily: bold,
  },
  statusBadge: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 6,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.black,
    textTransform: 'uppercase',
  },
  reporterName: {
    fontSize: adjust(24),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  reporterId: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: h * 0.02,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  contactButtonText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  section: {
    backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginBottom: h * 0.02,
    borderRadius: 12,
    padding: w * 0.04,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.02,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: h * 0.015,
    gap: 12,
  },
  detailLabel: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    width: 70,
  },
  detailValue: {
    flex: 1,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: pallette.lightgrey,
    padding: w * 0.04,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: adjust(28),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  statLabel: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
    textTransform: 'uppercase',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: pallette.red,
    marginHorizontal: w * 0.04,
    paddingVertical: h * 0.018,
    borderRadius: 12,
    gap: 10,
    marginTop: h * 0.02,
  },
  removeButtonText: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.white,
  },
  emptyText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: h * 0.02,
    marginBottom: h * 0.03,
  },
  goBackButton: {
    backgroundColor: pallette.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  goBackText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  bottomSpacer: {
    height: h * 0.03,
  },
});

export default ReporterDetailsScreen;