// screens/VerifiedNewsScreen.jsx
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

const VerifiedNewsScreen = ({ dateFilter }) => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [verifiedNews, setVerifiedNews] = useState([]);
  const [error, setError] = useState(null);

  // Fetch verified news
  const fetchVerifiedNews = async () => {
    try {
      setError(null);
      
      const params = {
        status: 'verified',
        ...(dateFilter.startDate && { startDate: dateFilter.startDate }),
        ...(dateFilter.endDate && { endDate: dateFilter.endDate }),
        page: 1,
        limit: 20,
      };

      console.log('Fetching verified news:', params);
      
      const response = await userAPI.getVerifiedNews(params);
      
      if (response.success) {
        setVerifiedNews(response.data.news || response.data || []);
      } else {
        throw new Error(response.message || 'Failed to fetch verified news');
      }
    } catch (err) {
      console.error('Fetch verified news error:', err);
      setError(err.message || 'Failed to load verified news');
      setVerifiedNews([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial load and when date filter changes
  useEffect(() => {
    fetchVerifiedNews();
  }, [dateFilter]);

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    fetchVerifiedNews();
  };

  // Handle news item press
  const handleNewsPress = (news) => {
    navigation.navigate('NewsDetail', { 
      newsId: news._id || news.id,
      fromScreen: 'verified'
    });
  };

  // Get time period label
  const getTimePeriod = () => {
    if (dateFilter.filter === 'today') return 'Today';
    if (dateFilter.filter === '7days') return '7 Days';
    if (dateFilter.filter === '30days') return '30 Days';
    if (dateFilter.filter === 'custom') return 'Custom Period';
    return '15 days'; // Default as shown in image
  };

  // Format stats
  const formatNumber = (num) => {
    if (!num && num !== 0) return '0';
    if (num < 1000) return num.toString();
    return `${(num / 1000).toFixed(1)}k`;
  };

  // Render category tags
  const renderCategories = (categories) => {
    if (!categories || !Array.isArray(categories)) return null;
    
    return (
      <View style={styles.categoriesContainer}>
        {categories.slice(0, 3).map((category, index) => (
          <View key={index} style={styles.categoryTag}>
            <Text style={styles.categoryText}>{category}</Text>
          </View>
        ))}
      </View>
    );
  };

  // Render stats row
  const renderStats = (item) => {
    return (
      <View style={styles.statsContainer}>
        {/* Replies */}
        <View style={styles.statItem}>
          <Icon name="comment" size={adjust(14)} color={pallette.grey} />
          {/* <Text style={styles.statLabel}>Replies</Text> */}
          <Text style={styles.statValue}>{formatNumber(item.replies || 45)}</Text>
        </View>
        
        {/* Views */}
        <View style={styles.statItem}>
          <Icon name="eye" size={adjust(14)} color={pallette.grey} />
          {/* <Text style={styles.statLabel}>Views</Text> */}
          <Text style={styles.statValue}>{formatNumber(item.views || 34)}</Text>
        </View>
        
        {/* Reads */}
        <View style={styles.statItem}>
          <Icon name="heart" size={adjust(14)} color={pallette.grey} />
          {/* <Text style={styles.statLabel}>Reads</Text> */}
          <Text style={styles.statValue}>{formatNumber(item.reads || 15)}</Text>
        </View>
        
        {/* Shares */}
        <View style={styles.statItem}>
          <Icon name="share-nodes" size={adjust(14)} color={pallette.grey} />
          {/* <Text style={styles.statLabel}>Shares</Text> */}
          <Text style={styles.statValue}>{formatNumber(item.shares || 0)}</Text>
        </View>
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
      <Text style={styles.newsDescription} numberOfLines={2}>
        {item.description || 'No description available'}
      </Text>

      {/* Stats Row */}
      {renderStats(item)}

      {/* Categories */}
      {renderCategories(item.categories || item.tags || ['Politics', 'Local News', 'Breaking News'])}
      
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
        <Text style={styles.headerTitle}>Recent Verified News</Text>
      </View> */}

      {/* News List */}
      <FlatList
        data={verifiedNews}
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
            <Icon name="circle-check" size={adjust(60)} color={pallette.lightgrey} />
            <Text style={styles.emptyText}>No verified news articles</Text>
            <Text style={styles.emptySubtext}>
              Approved news will appear here
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
    paddingBottom: h * 0.01,
    backgroundColor: pallette.white,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: adjust(18),
    fontFamily: bold,
    color: pallette.black,
  },
  headerPeriod: {
    fontSize: adjust(14),
    fontFamily: medium,
    color: pallette.primary,
    backgroundColor: `${pallette.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
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
    color: pallette.darkgrey,
    lineHeight: adjust(20),
    marginBottom: h * 0.015,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: h * 0.015,
    paddingBottom: h * 0.01,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: adjust(11),
    fontFamily: medium,
    color: pallette.grey,
    marginTop: 2,
    marginBottom: 2,
  },
  statValue: {
    fontSize: adjust(14),
    fontFamily: bold,
    color: pallette.black,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    // marginTop: h * 0.01,
  },
  categoryTag: {
    backgroundColor: `${pallette.primary}10`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: adjust(12),
    fontFamily: medium,
    color: pallette.primary,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: pallette.lightgrey,
    marginTop: h * 0.015,
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

export default VerifiedNewsScreen;