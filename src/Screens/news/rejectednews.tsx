// screens/RejectedNewsScreen.jsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { useNavigation } from '@react-navigation/native';
import { pallette } from '../helpers/colors';
import { medium, bold } from '../helpers/fonts';
import { h, w, adjust } from '../../constants/dimensions';
import { userAPI } from '../../Axios/Api';
import ErrorMessage from '../helpers/errormessage';

const RejectedNewsScreen = ({ dateFilter }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [rejectedNews, setRejectedNews] = useState([]);
  const [error, setError] = useState(null);

  // Fetch rejected news
  const fetchRejectedNews = async () => {
    try {
      setError(null);
      
      const params = {
        status: 'rejected',
        ...(dateFilter.startDate && { startDate: dateFilter.startDate }),
        ...(dateFilter.endDate && { endDate: dateFilter.endDate }),
        page: 1,
        limit: 20,
      };

      console.log('Fetching rejected news:', params);
      
      const response = await userAPI.getRejectedNews (params);
      
      if (response.success) {
        setRejectedNews(response.data.news || response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch rejected news');
      }
    } catch (err) {
      console.error('Fetch rejected news error:', err);
      setError(err.message || 'Failed to load rejected news');
      setRejectedNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when date filter changes
  useEffect(() => {
    fetchRejectedNews();
  }, [dateFilter]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchRejectedNews();
  };

  // Handle news item press
  const handleNewsPress = (news) => {
    navigation.navigate('NewsDetail', { 
      newsId: news._id || news.id,
      fromScreen: 'rejected'
    });
  };

  // Get time period label
  const getTimePeriod = () => {
    if (dateFilter.filter === 'today') return 'Today';
    if (dateFilter.filter === '7days') return 'Last 7 Days';
    if (dateFilter.filter === '30days') return 'Last month';
    if (dateFilter.filter === 'custom') return 'Custom Period';
    return 'last month';
  };

  // Format rejection reason
  const getRejectionReason = (item) => {
    return item.rejectionReason || 'News doesn\'t contain detailed information clarity is low';
  };

  // Render category tags
  const renderCategories = (categories) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return (
      <View style={styles.categoriesContainer}>
        {categories.slice(0, 2).map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render news item
  const renderNewsItem = ({ item }) => (
    <TouchableOpacity
      style={styles.newsCard}
      onPress={() => handleNewsPress(item)}
      activeOpacity={0.9}
    >
      {/* News Title */}
      <Text style={styles.newsTitle} numberOfLines={1}>
        {item.title}
      </Text>

      {/* News Description */}
      <Text style={styles.newsDescription} numberOfLines={3}>
        {item.description || 'No description available'}
      </Text>

      {/* Repeat description lines (as shown in image)
      {[1, 2, 3].map((_, index) => (
        <Text key={index} style={styles.repeatedDescription} numberOfLines={1}>
          {item.title}
        </Text>
      ))} */}

      {/* Rejection Reason */}
      <View style={styles.rejectionContainer}>
        <Text style={styles.reasonLabel}>Reason : </Text>
        <Text style={styles.reasonText}>{getRejectionReason(item)}</Text>
      </View>

      {/* Categories */}
      {renderCategories(item.categories || item.tags || ['Politics', 'Local News'])}

      {/* Separator */}
      <View style={styles.cardSeparator} />
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={pallette.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Section */}
      {/* <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>Recent Rejected News</Text>
        <Text style={styles.headerPeriod}>{getTimePeriod()}</Text>
      </View> */}

      {/* News List */}
      <FlatList
        data={rejectedNews}
        renderItem={renderNewsItem}
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
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="circle-xmark" size={adjust(60)} color={pallette.lightgrey} />
            <Text style={styles.emptyText}>No rejected news articles</Text>
            <Text style={styles.emptySubtext}>
              Rejected news will appear here
            </Text>
          </View>
        }
      />
      
      <ErrorMessage message={error} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.lightgrey,
  },
  headerSection: {
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.02,
    paddingBottom: h * 0.016,
    backgroundColor: pallette.white,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  headerTitle: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.006,
  },
  headerPeriod: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
  },
  listContent: {
    paddingBottom: h * 0.02,
  },
  newsCard: {
     backgroundColor: pallette.white,
    marginHorizontal: w * 0.04,
    marginTop: h * 0.02,
    borderRadius: 8,
    paddingHorizontal: w * 0.04,
    paddingTop: h * 0.02,
    paddingBottom: h * 0.015,
    shadowColor: pallette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  newsTitle: {
    fontSize: adjust(16),
    fontFamily: bold,
    color: pallette.black,
    marginBottom: h * 0.01,
  },
  newsDescription: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    lineHeight: adjust(20),
    marginBottom: h * 0.008,
  },
  repeatedDescription: {
    fontSize: adjust(13),
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: h * 0.004,
    fontStyle: 'italic',
  },
  rejectionContainer: {
    flexDirection: 'row',
    marginTop: h * 0.012,
    marginBottom: h * 0.01,
    alignItems: 'flex-start',
  },
  reasonLabel: {
    fontSize: adjust(13),
    fontFamily: bold,
    color: pallette.red,
  },
  reasonText: {
    flex: 1,
    fontSize: adjust(13),
    fontFamily: medium,
    color: pallette.red,
    lineHeight: adjust(18),
  },
  categoriesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: h * 0.008,
  },
  categoryTag: {
    backgroundColor: `${pallette.red}10`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: `${pallette.red}30`,
  },
  categoryText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.red,
  },
  cardSeparator: {
    // Already using borderBottom on newsCard
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: h * 0.2,
  },
  emptyText: {
    fontSize: adjust(16),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: h * 0.02,
  },
  emptySubtext: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: h * 0.01,
  },
});

export default RejectedNewsScreen;