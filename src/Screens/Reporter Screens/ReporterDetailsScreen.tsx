import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Linking,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation, useRoute } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import AlertMessage from '../helpers/alertmessage';
import apiService, { userAPI } from '../../Axios/Api';
import Loader from '../helpers/loader';
import Header from '../helpers/header';

const ReporterDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { reporterId } = route.params || {};
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reporter, setReporter] = useState(null);
 const [stats, setStats] = useState({
    today: {
        "Total News": 0,
        "Pending News": 0,
        "Published News": 0,
        "Rejected News": 0
    },
    total: {
        "Total News": 0,
        "Pending News": 0,
        "Published News": 0,
        "Rejected News": 0
    }
});
  const [toast, setToast] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [showCallAlert, setShowCallAlert] = useState(false);
  const [showRemoveAlert, setShowRemoveAlert] = useState(false);

  // Fetch reporter details
  const fetchReporterDetails = async () => {
    try {
      setLoading(true);
      
      const reporterResponse = await apiService.getReporterById(reporterId,2);
      console.log(reporterResponse)
      if (reporterResponse.error==false) {
        setReporter(reporterResponse.data);
        
        const statsResponse = await apiService.getDashboardStats(reporterId,2);
        if (statsResponse.error==false) {
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

  // Initial load
  useEffect(() => {
    if (reporterId) {
      fetchReporterDetails();
    } else {
      setToast({
        message: 'Reporter ID is required',
        type: 'error'
      });
      setTimeout(() => navigation.goBack(), 1500);
    }
  }, [reporterId]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReporterDetails();
  };

  // Handle call press
  const handleCallPress = () => {
    if (reporter?.phone) {
      setShowCallAlert(true);
    } else {
      setAlertMessage('Phone number not available');
    }
  };

  // Confirm phone call
  const confirmPhoneCall = (confirmed) => {
    setShowCallAlert(false);
    if (confirmed && reporter?.phone) {
      const phoneUrl = `tel:${reporter.phone}`;
      Linking.openURL(phoneUrl).catch(() => {
        setAlertMessage('Unable to make phone call');
      });
    }
  };

  // Handle email press
  const handleEmailPress = () => {
    if (reporter?.email) {
      const emailUrl = `mailto:${reporter.email}`;
      Linking.openURL(emailUrl).catch(() => {
        setAlertMessage('Unable to open email app');
      });
    } else {
      setAlertMessage('Email not available');
    }
  };

  // Handle remove reporter
  const handleRemoveReporter = () => {
    if (reporter?.status === 'active') {
      setAlertMessage('Cannot remove active reporter. Please suspend first.');
      return;
    }
    setShowRemoveAlert(true);
  };

  // Confirm remove reporter
  const confirmRemoveReporter = async (confirmed) => {
    setShowRemoveAlert(false);
    
    if (!confirmed) return;
    
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
  };

  // Handle view news by status
  const handleViewNewsByStatus = (status) => {
    if (!reporter) return;
    
    navigation.navigate('NewsList', { 
      reporterId,
      status,
      reporterName: reporter.name 
    });
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    if (!status) return pallette.grey;
    
    switch (status.toLowerCase()) {
      case 'active': return pallette.primary;
      case 'pending': return pallette.gold;
      case 'suspended': return pallette.red;
      default: return pallette.grey;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Render loading state
  if (loading && !refreshing) {
    return <Loader />;
  }

  // Render error state
  if (!reporterId || !reporter) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          onback={() => navigation.goBack()}
          active={1}
          onSkip={() => {}}
          skippable={false}
          hastitle={true}
          title={'Reporter Details'}
        />
        
        <View style={styles.errorContainer}>
          <Icon name="user-slash" size={adjust(60)} color={pallette.lightgrey} />
          <Text style={styles.errorText}>Reporter not found</Text>
          <TouchableOpacity 
            style={styles.goBackButton}
            onPress={() => navigation.goBack()}
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
      
      {/* Header */}
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
          
          <Text style={styles.reporterName}>{reporter.name || 'Unnamed Reporter'}</Text>
          <Text style={styles.reporterId}>
            ID: {reporter.reporterId || reporter._id?.substring(0, 8) || 'N/A'}
          </Text>
          
          <View style={styles.contactButtons}>
            <TouchableOpacity 
              style={[styles.contactButton, !reporter.phone && styles.disabledButton]}
              onPress={handleCallPress}
              disabled={!reporter.phone}
            >
              <Icon name="phone" size={16} color={pallette.white} />
              <Text style={styles.contactButtonText}>Call</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.contactButton, !reporter.email && styles.disabledButton]}
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
            <Text style={styles.detailLabel}>Phone</Text>
            <Text style={styles.detailValue}>{reporter.phone || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="envelope" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{reporter.email || 'Not provided'}</Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="location-dot" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue}>
              {[reporter.address, reporter.city, reporter.state]
                .filter(Boolean)
                .join(', ') || 'Not provided'}
              {reporter.pincode && ` - ${reporter.pincode}`}
            </Text>
          </View>
        </View>

        {/* Identification Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Identification</Text>
          
          <View style={styles.detailItem}>
            <Icon name="id-card" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>ID Proof</Text>
            <Text style={styles.detailValue}>
              {reporter.idProofType && `${reporter.idProofType.toUpperCase()}: `}
              {reporter.idProofNumber || 'Not provided'}
            </Text>
          </View>
          
          <View style={styles.detailItem}>
            <Icon name="calendar" size={16} color={pallette.grey} />
            <Text style={styles.detailLabel}>Joined</Text>
            <Text style={styles.detailValue}>{formatDate(reporter.createdAt)}</Text>
          </View>
          
          {reporter.experience && (
            <View style={styles.detailItem}>
              <Icon name="briefcase" size={16} color={pallette.grey} />
              <Text style={styles.detailLabel}>Experience</Text>
              <Text style={styles.detailValue}>{reporter.experience} years</Text>
            </View>
          )}
        </View>

        {/* News Statistics */}
        <View style={styles.section}>
  <Text style={styles.sectionTitle}>Total News Statistics</Text>
  
  <View style={styles.statsGrid}>
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('all')}
    >
      <Text style={styles.statNumber}>{stats.total["Total News"] || 0}</Text>
      <Text style={styles.statLabel}>Total News</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('pending')}
    >
      <Text style={[styles.statNumber, { color: pallette.gold }]}>
        {stats.total["Pending News"] || 0}
      </Text>
      <Text style={styles.statLabel}>Pending</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('verified')}
    >
      <Text style={[styles.statNumber, { color: pallette.primary }]}>
        {stats.total["Published News"] || 0}
      </Text>
      <Text style={styles.statLabel}>Verified</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('rejected')}
    >
      <Text style={[styles.statNumber, { color: pallette.red }]}>
        {stats.total["Rejected News"] || 0}
      </Text>
      <Text style={styles.statLabel}>Rejected</Text>
    </TouchableOpacity>
  </View>
</View>
  <View style={styles.section}>
  <Text style={styles.sectionTitle}>Today News Statistics</Text>
  
  <View style={styles.statsGrid}>
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('all')}
    >
      <Text style={styles.statNumber}>{stats.today["Total News"] || 0}</Text>
      <Text style={styles.statLabel}>Total News</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('pending')}
    >
      <Text style={[styles.statNumber, { color: pallette.gold }]}>
        {stats.today["Pending News"] || 0}
      </Text>
      <Text style={styles.statLabel}>Pending</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('verified')}
    >
      <Text style={[styles.statNumber, { color: pallette.primary }]}>
        {stats.today["Published News"] || 0}
      </Text>
      <Text style={styles.statLabel}>Verified</Text>
    </TouchableOpacity>
    
    <TouchableOpacity 
      style={styles.statCard}
      onPress={() => handleViewNewsByStatus('rejected')}
    >
      <Text style={[styles.statNumber, { color: pallette.red }]}>
        {stats.today["Rejected News"] || 0}
      </Text>
      <Text style={styles.statLabel}>Rejected</Text>
    </TouchableOpacity>
  </View>
</View>
        

        {/* Action Buttons */}
        <TouchableOpacity 
          style={[styles.removeButton, (reporter.status === 'active') && styles.disabledButton]}
          onPress={handleRemoveReporter}
          disabled={reporter.status === 'active' || loading}
        >
          <Icon name="trash" size={18} color={pallette.white} />
          <Text style={styles.removeButtonText}>
            {reporter.status === 'active' ? 'Cannot Remove Active Reporter' : 'Remove Reporter'}
          </Text>
        </TouchableOpacity>

        {/* Bottom Spacer */}
        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* Alert Messages */}
      {alertMessage ? (
        <AlertMessage
          message={alertMessage}
          onClose={() => setAlertMessage('')}
        />
      ) : null}
      
      {showCallAlert ? (
        <AlertMessage
          message={`Do you want to call ${reporter.phone}?`}
          onClose={confirmPhoneCall}
          showConfirm={true}
        />
      ) : null}
      
      {showRemoveAlert ? (
        <AlertMessage
          message="Are you sure you want to remove this reporter? This action cannot be undone."
          onClose={confirmRemoveReporter}
          showConfirm={true}
        />
      ) : null}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: w * 0.1,
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
    textAlign: 'center',
    paddingHorizontal: w * 0.1,
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
  disabledButton: {
    backgroundColor: pallette.grey,
    opacity: 0.6,
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
    width: 80,
  },
  detailValue: {
    flex: 1,
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.black,
    flexWrap: 'wrap',
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
  errorText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: h * 0.02,
    marginBottom: h * 0.03,
    textAlign: 'center',
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