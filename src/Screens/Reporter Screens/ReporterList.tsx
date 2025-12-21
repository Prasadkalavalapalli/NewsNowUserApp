// screens/ReporterList.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
  Alert,
  ScrollView,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import ToastMessage from '../helpers/ToastMessage';
import { userAPI } from '../../Axios/Api';
import ReporterDetailsScreen from './ReporterDetailsScreen';
import Loader from '../helpers/loader';

const ReporterList = () => {
  const navigation = useNavigation();
  
  // State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reporters, setReporters] = useState([]);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedReporter, setSelectedReporter] = useState(null);
  const [showActionsModal, setShowActionsModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    pending: 0,
    suspended: 0,
  });

  // Filter options
  const filterOptions = [
    { id: 'all', label: 'All', icon: 'users' },
    { id: 'active', label: 'Active', icon: 'circle-check' },
    { id: 'pending', label: 'Pending', icon: 'clock' },
    { id: 'suspended', label: 'Suspended', icon: 'user-slash' },
  ];

  // Fetch reporters
  const fetchReporters = async () => {
    try {
      const response = await userAPI.getReporters();
      
      if (response.success) {
        const reportersData = response.data.reporters || response.data || [];
        setReporters(reportersData);
        
        // Calculate stats
        const stats = {
          total: reportersData.length,
          active: reportersData.filter(r => r.status === 'active').length,
          pending: reportersData.filter(r => r.status === 'pending').length,
          suspended: reportersData.filter(r => r.status === 'suspended').length,
        };
        setStats(stats);
      }
    } catch (err) {
      setToast({
        message: 'Failed to load reporters',
        type: 'error'
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchReporters();
  }, []);

  // Apply filters when status changes
  useEffect(() => {
    let filtered = [...reporters];
    
    if (filterStatus !== 'all') {
      filtered = filtered.filter(reporter => reporter.status === filterStatus);
    }
    
    setFilteredReporters(filtered);
  }, [filterStatus, reporters]);

  // Filtered reporters based on status
  const [filteredReporters, setFilteredReporters] = useState([]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchReporters();
  };

  // Handle filter change
  const handleFilterChange = (status) => {
    setFilterStatus(status);
  };

  // Handle reporter press
  const handleReporterPress = (reporter) => {
    console.log(reporter)
    navigation.navigate(ReporterDetailsScreen,{ reporterId:  reporter.id||1 });
    // navigation.navigate('ReporterDetail', { reporterId: reporter._id || reporter.id });
    console.log('Reporter pressed:', reporter.name);
  };

  // Handle actions press
  const handleActionsPress = (reporter, event) => {
    event?.stopPropagation();
    setSelectedReporter(reporter);
    setShowActionsModal(true);
  };

  // Handle approve reporter
  const handleApproveReporter = async (reporterId) => {
    try {
      setLoading(true);
      
      const response = await userAPI.approveReporter(reporterId);
      
      if (response.success) {
        setToast({
          message: 'Reporter approved successfully',
          type: 'success'
        });
        
        // Update local state
        setReporters(prev => prev.map(reporter =>
          reporter._id === reporterId
            ? { ...reporter, status: 'active' }
            : reporter
        ));
        
        setShowActionsModal(false);
      }
    } catch (error) {
      setToast({
        message: 'Failed to approve reporter',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle suspend reporter
  const handleSuspendReporter = async (reporterId) => {
    Alert.alert(
      'Suspend Reporter',
      'Are you sure you want to suspend this reporter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Suspend',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await userAPI.suspendReporter(reporterId);
              
              if (response.success) {
                setToast({
                  message: 'Reporter suspended successfully',
                  type: 'success'
                });
                
                // Update local state
                setReporters(prev => prev.map(reporter =>
                  reporter._id === reporterId
                    ? { ...reporter, status: 'suspended' }
                    : reporter
                ));
                
                setShowActionsModal(false);
              }
            } catch (error) {
              setToast({
                message: 'Failed to suspend reporter',
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

  // Handle delete reporter
  const handleDeleteReporter = async (reporterId) => {
    Alert.alert(
      'Delete Reporter',
      'Are you sure you want to delete this reporter?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              
              const response = await userAPI.deleteReporter(reporterId);
              
              if (response.success) {
                setToast({
                  message: 'Reporter deleted successfully',
                  type: 'success'
                });
                
                // Remove from local state
                setReporters(prev => prev.filter(reporter => reporter._id !== reporterId));
                
                setShowActionsModal(false);
              }
            } catch (error) {
              setToast({
                message: 'Failed to delete reporter',
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

  // Handle call reporter
  const handleCallReporter = (phoneNumber) => {
    if (!phoneNumber) {
      setToast({
        message: 'Phone number not available',
        type: 'warning'
      });
      return;
    }

    Alert.alert(
      'Call Reporter',
      `Do you want to call ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            const phoneUrl = `tel:${phoneNumber}`;
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
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return pallette.primary;
      case 'pending': return pallette.gold;
      case 'suspended': return pallette.red;
      default: return pallette.grey;
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Active';
      case 'pending': return 'Pending';
      case 'suspended': return 'Suspended';
      default: return 'Unknown';
    }
  };

  // Render reporter item
  const renderReporterItem = ({ item }) => (
    <TouchableOpacity
      style={styles.reporterCard}
      onPress={() => handleReporterPress(item)}
      activeOpacity={0.9}
    >
      <View style={styles.cardHeader}>
        <View style={styles.reporterInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.name?.charAt(0)?.toUpperCase() || 'R'}
            </Text>
          </View>
          <View style={styles.nameContainer}>
            <Text style={styles.reporterName} numberOfLines={1}>
              {item.name || 'Unnamed Reporter'}
            </Text>
            <Text style={styles.reporterEmail} numberOfLines={1}>
              {item.email || 'No email'}
            </Text>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
          <TouchableOpacity
            style={styles.moreButton}
            onPress={(e) => handleActionsPress(item, e)}
          >
            <Icon name="ellipsis-vertical" size={16} color={pallette.grey} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.contactInfo}>
        <View style={styles.contactItem}>
          <Icon name="phone" size={12} color={pallette.grey} />
          <Text style={styles.contactText}>{item.phone || 'No phone'}</Text>
        </View>
        <View style={styles.contactItem}>
          <Icon name="location-dot" size={12} color={pallette.grey} />
          <Text style={styles.contactText}>
            {item.city || 'Unknown'} • {item.state || 'Unknown'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Icon name="users" size={adjust(60)} color={pallette.lightgrey} />
      <Text style={styles.emptyTitle}>No Reporters Found</Text>
      <Text style={styles.emptyText}>
        {filterStatus !== 'all'
          ? 'Try changing your filter'
          : 'No reporters have registered yet'}
      </Text>
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate('ReporterRegistration')}
      >
        <Icon name="user-plus" size={16} color={pallette.white} />
        <Text style={styles.addButtonText}>Add First Reporter</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <Loader/>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={pallette.white} />
      
      {toast && (
        <ToastMessage
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Text style={styles.title}>
                <Icon name="arrow-left" size={adjust(20)} color={pallette.black} /> Reporters
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.addReporterButton}
              onPress={() => navigation.navigate('ReporterRegistration')}
            >
              <Icon name="user-plus" size={16} color={pallette.white} />
              <Text style={styles.addButtonText}>Add Reporter</Text>
            </TouchableOpacity>
          </View>         
        </View>
        
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
        >
          {filterOptions.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterButton,
                filterStatus === filter.id && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterChange(filter.id)}
            >
              <Icon
                name={filter.icon}
                size={14}
                color={filterStatus === filter.id ? pallette.white : pallette.grey}
              />
              <Text
                style={[
                  styles.filterText,
                  filterStatus === filter.id && styles.filterTextActive,
                ]}
              >
                {filter.label} ({filter.id === 'all' ? stats.total : stats[filter.id]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <FlatList
          data={filteredReporters}
          renderItem={renderReporterItem}
          keyExtractor={(item) => item._id || item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[pallette.primary]}
              tintColor={pallette.primary}
            />
          }
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            filteredReporters.length > 0 && (
              <View style={styles.listHeader}>
              
              </View>
            )
          }
        />
      </View>

      <Modal
        visible={showActionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowActionsModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowActionsModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Reporter Actions</Text>
              <TouchableOpacity onPress={() => setShowActionsModal(false)}>
                <Icon name="xmark" size={20} color={pallette.black} />
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalReporterName}>
              {selectedReporter?.name}
            </Text>
            <Text style={styles.modalReporterEmail}>
              {selectedReporter?.email}
            </Text>
            
            <View style={styles.modalActions}>
              {selectedReporter?.status === 'pending' && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleApproveReporter(selectedReporter._id)}
                >
                  <Icon name="circle-check" size={18} color={pallette.primary} />
                  <Text style={[styles.modalButtonText, { color: pallette.primary }]}>
                    Approve Reporter
                  </Text>
                </TouchableOpacity>
              )}
              
              {selectedReporter?.status === 'active' && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleSuspendReporter(selectedReporter._id)}
                >
                  <Icon name="user-slash" size={18} color={pallette.gold} />
                  <Text style={[styles.modalButtonText, { color: pallette.gold }]}>
                    Suspend Reporter
                  </Text>
                </TouchableOpacity>
              )}
              
              {selectedReporter?.status === 'suspended' && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => handleApproveReporter(selectedReporter._id)}
                >
                  <Icon name="user-check" size={18} color={pallette.primary} />
                  <Text style={[styles.modalButtonText, { color: pallette.primary }]}>
                    Reactivate Reporter
                  </Text>
                </TouchableOpacity>
              )}
              
              {selectedReporter?.phone && (
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => {
                    setShowActionsModal(false);
                    handleCallReporter(selectedReporter.phone);
                  }}
                >
                  <Icon name="phone" size={18} color={pallette.l1} />
                  <Text style={[styles.modalButtonText, { color: pallette.l1 }]}>
                    Call Reporter
                  </Text>
                </TouchableOpacity>
              )}
              
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => {
                  setShowActionsModal(false);
                  handleReporterPress(selectedReporter);
                }}
              >
                <Icon name="eye" size={18} color={pallette.grey} />
                <Text style={[styles.modalButtonText, { color: pallette.grey }]}>
                  View Details
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.deleteButton]}
                onPress={() => handleDeleteReporter(selectedReporter._id)}
              >
                <Icon name="trash" size={18} color={pallette.red} />
                <Text style={[styles.modalButtonText, { color: pallette.red }]}>
                  Delete Reporter
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    paddingTop: 20,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  headerSection: {
    backgroundColor: pallette.white,
    paddingHorizontal: w * 0.04,
    paddingVertical: h * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.01,
  },
  title: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
  },
  addReporterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    color: pallette.white,
    fontSize: adjust(14),
    fontFamily: medium,
  },
  filterContainer: {
    backgroundColor: pallette.white,
    paddingHorizontal: 3,
    paddingVertical: 2,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    gap: 6,
  },
  filterButtonActive: {
    backgroundColor: pallette.primary,
  },
  filterText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.grey,
  },
  filterTextActive: {
    color: pallette.white,
  },
  listContent: {
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.015,
    paddingBottom: h * 0.02,
  },
  listHeader: {
    marginBottom: h * 0.015,
  },
  listHeaderTitle: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
  },
  reporterCard: {
    backgroundColor: pallette.white,
    borderRadius: 12,
    padding: w * 0.04,
    marginBottom: h * 0.015,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: h * 0.015,
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: w * 0.03,
  },
  avatarText: {
    color: pallette.white,
    fontSize: adjust(20),
    fontFamily: bold,
  },
  nameContainer: {
    flex: 1,
  },
  reporterName: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  reporterEmail: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: h * 0.01,
  },
  statusText: {
    fontSize: adjust(10),
    fontFamily: bold,
    color: pallette.white,
    textTransform: 'uppercase',
  },
  moreButton: {
    padding: 4,
  },
  contactInfo: {
    flexDirection: 'row',
    marginBottom: h * 0.015,
    paddingBottom: h * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: w * 0.04,
  },
  contactText: {
    fontSize: adjust(12),
    fontFamily: regular,
    color: pallette.grey,
    marginLeft: 6,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: h * 0.15,
  },
  emptyTitle: {
    fontSize: adjust(18),
    fontFamily: semibold,
    color: pallette.darkgrey,
    marginTop: h * 0.02,
    marginBottom: h * 0.01,
  },
  emptyText: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
    textAlign: 'center',
    marginBottom: h * 0.03,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: pallette.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: w * 0.04,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: h * 0.015,
  },
  modalTitle: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
  },
  modalReporterName: {
    fontSize: adjust(16),
    fontFamily: semibold,
    color: pallette.black,
    marginBottom: h * 0.005,
  },
  modalReporterEmail: {
    fontSize: adjust(14),
    fontFamily: regular,
    color: pallette.grey,
    marginBottom: h * 0.02,
  },
  modalActions: {
    paddingTop: h * 0.01,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: h * 0.015,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
    gap: 12,
  },
  deleteButton: {
    borderBottomWidth: 0,
  },
  modalButtonText: {
    fontSize: adjust(15),
    fontFamily: medium,
  },
});

export default ReporterList;