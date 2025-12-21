import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { h, w } from '../../constants/dimensions';
import { pallette } from '../helpers/colors';
import { semibold, regular, medium } from '../helpers/fonts';
import { userAPI } from '../../Axios/Api';
import ReporterRegistration from '../Reporter Screens/ReporterRegister';
import ReporterList from '../Reporter Screens/ReporterList';

const AdminDashboard = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchData = async () => {
    try {
      const data = await userAPI.fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const statCards = [
    {
      title: 'Total News',
      value: stats?.totalNews || 0,
      icon: 'newspaper',
      color: '#4361ee',
      onPress: () => navigation.navigate('NewsList', { filter: 'all' }),
    },
    {
      title: 'Pending',
      value: stats?.pendingNews || 0,
      icon: 'clock',
      color: '#ff9e00',
      onPress: () => navigation.navigate('NewsList', { filter: 'pending' }),
    },
    {
      title: 'Verified',
      value: stats?.verifiedNews || 0,
      icon: 'circle-check',
      color: '#00b894',
      onPress: () => navigation.navigate('NewsList', { filter: 'verified' }),
    },
    {
      title: 'Rejected',
      value: stats?.rejectedNews || 0,
      icon: 'circle-xmark',
      color: '#ff6b6b',
      onPress: () => navigation.navigate('NewsList', { filter: 'rejected' }),
    },
  ];

  const actionCards = [
    {
      title: 'Reporters',
      value: stats?.totalReporters || 0,
      icon: 'users',
      color: '#6c5ce7',
      onPress: () => navigation.navigate(ReporterList),
    },
    {
      title: 'Notifications',
      value: stats?.totalNotifications || 0,
      icon: 'bell',
      color: '#00cec9',
      onPress: () => navigation.navigate('Notifications'),
    },
  ];

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={pallette.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard</Text>
        <TouchableOpacity onPress={onRefresh} style={styles.refreshBtn}>
          <Icon name="arrows-rotate" size={20} color={pallette.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={pallette.primary} />
        }
      >
        {/* Stats Grid */}
        <View style={styles.section}>
          {/* <Text style={styles.sectionTitle}>News Overview</Text> */}
          <View style={styles.grid}>
            {statCards.map((card, index) => (
              <TouchableOpacity key={index} style={styles.card} onPress={card.onPress}>
                <View style={[styles.iconCircle, { backgroundColor: `${card.color}15` }]}>
                  <Icon name={card.icon} size={22} color={card.color} />
                </View>
                <Text style={styles.cardValue}>{card.value}</Text>
                <Text style={styles.cardTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Management Cards */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Management</Text>
          <View style={styles.row}>
            {actionCards.map((card, index) => (
              <TouchableOpacity key={index} style={styles.managementCard} onPress={card.onPress}>
                <Icon name={card.icon} size={26} color={card.color} />
                <Text style={styles.managementValue}>{card.value}</Text>
                <Text style={styles.managementTitle}>{card.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Summary */}
        <View style={styles.summaryBox}>
          <Text style={styles.summaryTitle}>Today's Summary</Text>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Icon name="arrow-up" size={16} color="#00b894" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>New Articles</Text>
                <Text style={styles.summaryValue}>{stats?.todayNewArticles || 0}</Text>
              </View>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <View style={styles.summaryIcon}>
                <Icon name="check" size={16} color="#4361ee" />
              </View>
              <View>
                <Text style={styles.summaryLabel}>Verified</Text>
                <Text style={styles.summaryValue}>{stats?.todayVerified || 0}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity style={styles.actionBtn}>
              <Icon name="plus" size={18} color={pallette.primary} />
              <Text style={styles.actionText}>Add News</Text>
            </TouchableOpacity>
          <TouchableOpacity 
  style={styles.actionBtn} 
  onPress={() => navigation.navigate('ReporterRegistration')}
>
  <Icon name="user-plus" size={18} color={pallette.primary} />
  <Text style={styles.actionText}>Add Reporter</Text>
</TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Icon name="megaphone" size={18} color={pallette.primary} />
              <Text style={styles.actionText}>Create Banner</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn}>
              <Icon name="chart-column" size={18} color={pallette.primary} />
              <Text style={styles.actionText}>Analytics</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: semibold,
  },
  refreshBtn: {
    padding: 8,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 12,
    fontFamily: semibold,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a1a1a',
    marginBottom: 4,
    fontFamily: semibold,
  },
  cardTitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: regular,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  managementCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  managementValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1a1a1a',
    marginVertical: 8,
    fontFamily: semibold,
  },
  managementTitle: {
    fontSize: 14,
    color: '#666',
    fontFamily: regular,
  },
  summaryBox: {
    marginHorizontal: 16,
    marginTop: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 16,
    fontFamily: semibold,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  summaryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  summaryLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 2,
    fontFamily: regular,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    fontFamily: semibold,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: '#eee',
    marginHorizontal: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionBtn: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    color: '#1a1a1a',
    marginLeft: 10,
    fontFamily: medium,
  },
});

export default AdminDashboard;