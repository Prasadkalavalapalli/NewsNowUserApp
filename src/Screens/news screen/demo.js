// // NewsViewScreen.js
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   SafeAreaView,
//   StatusBar,
//   FlatList,
//   Dimensions,
//   RefreshControl,
//   TouchableOpacity
// } from 'react-native';
// import Icon from 'react-native-vector-icons/FontAwesome6';
// import { pallette } from '../helpers/colors';
// import { medium, bold } from '../helpers/fonts';
// import Loader from '../helpers/loader';
// import apiService from '../../Axios/Api';
// import ErrorMessage from '../helpers/errormessage';

// // Import components
// import NewsItem from '../news/NewsItem';
// import CommentsPanel from '../news/CommentsPanel';
// import FilterModal from '../filter/FilterModal';
// import { useLocation } from '../location/LocationContext';
// const { width: SCREEN_WIDTH } = Dimensions.get('window');

// const NewsViewScreen = () => {
//   const flatListRef = useRef(null);
//   const { displayLocation, fullLocation, error, refreshLocation } = useLocation();

//   const [loading, setLoading] = useState(true);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [showComments, setShowComments] = useState(false);
//   const [newsList, setNewsList] = useState([]);
  
//   console.log('fullLocation from context:', fullLocation); // Debug log

//   // Filter state
//   const [showFilterModal, setShowFilterModal] = useState(false);
//   const [selectedCategory, setSelectedCategory] = useState('');
//   const [selectedNewsType, setSelectedNewsType] = useState('');
//   const [selectedPriority, setSelectedPriority] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [locations, setLocations] = useState([]);
//   const [refreshing, setRefreshing] = useState(false);
//   const [currentVideoId, setCurrentVideoId] = useState(null);

//   // Initial data load
//   useEffect(() => {
//     loadLocations();
//   }, []);

//   // Load news when location is available
//   useEffect(() => {
//     console.log('Location changed, loading news...');
//     console.log('fullLocation:', fullLocation);
//     console.log('selectedLocation:', selectedLocation);
    
//     if (fullLocation && fullLocation !== 'Fetching...') {
//       loadPublishedNews();
//     } else if (error) {
//       // If location error, load all news
//       loadPublishedNews();
//     }
//   }, [fullLocation, error]);

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       // Refresh location first
//       // await refreshLocation();
//       // Then reload news
//       loadPublishedNews();
//     } catch (err) {
//       console.error('Refresh error:', err);
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const loadLocations = async () => {
//     try {
//       const mockLocations = [
//         // Andhra Pradesh
//         { id: 1, name: 'Alluri Sitharama Raju', code: 'ASR' },
//         { id: 2, name: 'Anakapalli', code: 'AKP' },
//         { id: 3, name: 'Ananthapuramu', code: 'ATP' },
//         { id: 4, name: 'Annamayya', code: 'ANN' },
//         { id: 5, name: 'Bapatla', code: 'BPT' },
//         { id: 6, name: 'Chittoor', code: 'CTR' },
//         { id: 7, name: 'Dr. B.R. Ambedkar Konaseema', code: 'KNS' },
//         { id: 8, name: 'East Godavari', code: 'EGD' },
//         { id: 9, name: 'Eluru', code: 'ELR' },
//         { id: 10, name: 'Guntur', code: 'GNT' },
//         { id: 11, name: 'Kakinada', code: 'KKD' },
//         { id: 12, name: 'Krishna', code: 'KRS' },
//         { id: 13, name: 'Kurnool', code: 'KNL' },
//         { id: 14, name: 'Manyam', code: 'MNM' },
//         { id: 15, name: 'Nandyal', code: 'NDL' },
//         { id: 16, name: 'Nellore', code: 'NLR' },
//         { id: 17, name: 'NTR', code: 'NTR' },
//         { id: 18, name: 'Palnadu', code: 'PLD' },
//         { id: 19, name: 'Parvathipuram Manyam', code: 'PVM' },
//         { id: 20, name: 'Prakasam', code: 'PKM' },
//         { id: 21, name: 'Srikakulam', code: 'SKL' },
//         { id: 22, name: 'Sri Sathya Sai', code: 'SSS' },
//         { id: 23, name: 'Tirupati', code: 'TPT' },
//         { id: 24, name: 'Visakhapatnam', code: 'VSK' },
//         { id: 25, name: 'Vizianagaram', code: 'VZM' },
//         { id: 26, name: 'West Godavari', code: 'WGD' },
//         { id: 27, name: 'YSR Kadapa', code: 'KDP' },
//         // Telangana
//         { id: 28, name: 'Adilabad', code: 'ADB' },
//         { id: 29, name: 'Bhadradri Kothagudem', code: 'BKG' },
//         { id: 30, name: 'Hanumakonda', code: 'HMK' },
//         { id: 31, name: 'Hyderabad', code: 'HYD' },
//         { id: 32, name: 'Jagtial', code: 'JTL' },
//         { id: 33, name: 'Jangaon', code: 'JGN' },
//         { id: 34, name: 'Jayashankar Bhupalpally', code: 'JBP' },
//         { id: 35, name: 'Jogulamba Gadwal', code: 'JGD' },
//         { id: 36, name: 'Kamareddy', code: 'KMR' },
//         { id: 37, name: 'Karimnagar', code: 'KRM' },
//         { id: 38, name: 'Khammam', code: 'KMM' },
//         { id: 39, name: 'Komaram Bheem Asifabad', code: 'KBA' },
//         { id: 40, name: 'Mahabubabad', code: 'MBD' },
//         { id: 41, name: 'Mahabubnagar', code: 'MBN' },
//         { id: 42, name: 'Mancherial', code: 'MCL' },
//         { id: 43, name: 'Medak', code: 'MDK' },
//         { id: 44, name: 'Medchal–Malkajgiri', code: 'MMG' },
//         { id: 45, name: 'Mulugu', code: 'MLG' },
//         { id: 46, name: 'Nagarkurnool', code: 'NGK' },
//         { id: 47, name: 'Nalgonda', code: 'NLG' },
//         { id: 48, name: 'Narayanpet', code: 'NRP' },
//         { id: 49, name: 'Nirmal', code: 'NRM' },
//         { id: 50, name: 'Nizamabad', code: 'NZB' },
//         { id: 51, name: 'Peddapalli', code: 'PDP' },
//         { id: 52, name: 'Rajanna Sircilla', code: 'RSC' },
//         { id: 53, name: 'Ranga Reddy', code: 'RRD' },
//         { id: 54, name: 'Sangareddy', code: 'SGR' },
//         { id: 55, name: 'Siddipet', code: 'SDP' },
//         { id: 56, name: 'Suryapet', code: 'SRP' },
//         { id: 57, name: 'Vikarabad', code: 'VKB' },
//         { id: 58, name: 'Wanaparthy', code: 'WNP' },
//         { id: 59, name: 'Warangal', code: 'WRG' },
//         { id: 60, name: 'Yadadri Bhuvanagiri', code: 'YBG' },
//       ];
//       setLocations(mockLocations);
//     } catch (error) {
//       console.error('Failed to load locations:', error);
//     }
//   };

//   // FIXED: Pass district parameter to API
//   const loadPublishedNews = async (filters = {}) => {
//     console.log('Loading news with filters:', filters);
    
//     try {
//       setLoading(true);
      
//       // Build query parameters - use 'district' parameter
//       const queryParams = {};
      
//       // If user selected a location in filters, use it
//       if (filters.district) {
//         queryParams.district = filters.district;
//         console.log('Using filter district:', filters.district);
//       }
//       // Otherwise if user selected a location from modal, use it
//       else if (selectedLocation) {
//         queryParams.district = selectedLocation;
//         console.log('Using selected location:', selectedLocation);
//       }
//       // Otherwise use the user's current district
//       else if (fullLocation && fullLocation !== 'Fetching...' && fullLocation !== 'Permission denied') {
//         queryParams.district = fullLocation;
//         console.log('Using user district:', fullLocation);
//       }
      
//       // Add other filters
//       if (filters.category || selectedCategory) {
//         queryParams.category = filters.category || selectedCategory;
//       }
//       if (filters.newsType || selectedNewsType) {
//         queryParams.newsType = filters.newsType || selectedNewsType;
//       }
//       if (filters.priority || selectedPriority) {
//         queryParams.priority = filters.priority || selectedPriority;
//       }
      
//       console.log('Final API params:', queryParams);
      
//       const response = await apiService.getPublishedNews(queryParams);
      
//       if (response?.error === false) {
//         setNewsList(response.data || []);
//       } else {
//         setNewsList([]);
//       }
//     } catch (error) {
//       console.error('Error loading news:', error);
//       ErrorMessage.show('Failed to load news');
//       setNewsList([]);
//     } finally {
//       setLoading(false);
//       setRefreshing(false);
//     }
//   };

//   const formatTime = (timestamp) => {
//     try {
//       const date = new Date(timestamp);
//       const now = new Date();
//       const diffMs = now - date;
//       const diffMins = Math.floor(diffMs / 60000);
//       const diffHours = Math.floor(diffMs / 3600000);
//       const diffDays = Math.floor(diffMs / 86400000);

//       if (diffMins < 1) return 'Just now';
//       if (diffMins < 60) return `${diffMins} min ago`;
//       if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
//       if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
      
//       return date.toLocaleDateString();
//     } catch (error) {
//       return 'Recently';
//     }
//   };

//   const currentNews = newsList[currentIndex] || {};
//   const currentNewsId = currentNews.id;

//   const handleSwipe = useCallback((event) => {
//     const contentOffsetX = event.nativeEvent.contentOffset.x;
//     const index = Math.round(contentOffsetX / SCREEN_WIDTH);
//     setCurrentIndex(index);
//     setShowComments(false);
//     setCurrentVideoId(null);
//   }, []);

//   const handleCommentPress = useCallback((newsId) => {
//     setShowComments(prev => !prev);
//   }, []);

//   const handleVideoPlayback = useCallback((newsId) => {
//     setCurrentVideoId(prevId => prevId === newsId ? null : newsId);
//   }, []);

//   // FIXED: Pass district parameter correctly
//   const applyFilters = useCallback(async () => {
//     try {
//       const filters = {};
      
//       // Pass district if selected
//       if (selectedLocation) {
//         filters.district = selectedLocation;
//         console.log('Applying filters with district:', selectedLocation);
//       } else if (fullLocation && fullLocation !== 'Fetching...') {
//         filters.district = fullLocation;
//         console.log('Applying filters with user district:', fullLocation);
//       }
      
//       // Pass other filters
//       if (selectedCategory) filters.category = selectedCategory;
//       if (selectedNewsType) filters.newsType = selectedNewsType;
//       if (selectedPriority) filters.priority = selectedPriority;
      
//       await loadPublishedNews(filters);
//       setShowFilterModal(false);
//       setCurrentIndex(0);
//       setCurrentVideoId(null);
//     } catch (error) {
//       console.error('Apply filters error:', error);
//       ErrorMessage.show('Failed to apply filters');
//     }
//   }, [selectedCategory, selectedNewsType, selectedPriority, selectedLocation, fullLocation]);

//   const clearFilters = useCallback(async () => {
//     setSelectedCategory('');
//     setSelectedNewsType('');
//     setSelectedPriority('');
//     setSelectedLocation('');
    
//     // Load news with user's current district
//     const filters = {};
//     if (fullLocation && fullLocation !== 'Fetching...') {
//       filters.district = fullLocation;
//     }
    
//     await loadPublishedNews(filters);
//     setShowFilterModal(false);
//     setCurrentVideoId(null);
//   }, [fullLocation]);

//   if (loading && !refreshing) return <Loader />;

//   if (newsList.length === 0) {
//     return (
//       <SafeAreaView style={styles.container}>
//         <StatusBar barStyle="light-content" backgroundColor={pallette.black} />
//         <View style={styles.emptyContainer}>
//           <Icon name="newspaper" size={60} color={pallette.grey} />
//           <Text style={styles.emptyText}>No news available</Text>
//           {/* {fullLocation && fullLocation !== 'Fetching...' && (
//             <Text style={styles.locationText}>Current Location: {fullLocation}</Text>
//           )}
//           {error && <Text style={styles.errorText}>{error}</Text>} */}
//           <TouchableOpacity 
//             style={styles.filterButtonEmpty} 
//             onPress={() => setShowFilterModal(true)}
//             activeOpacity={0.7}
//           >
//             <Text style={styles.filterButtonEmptyText}>Try different filters</Text>
//           </TouchableOpacity>
//         </View>
//         <FilterModal 
//           showFilterModal={showFilterModal}
//           setShowFilterModal={setShowFilterModal}
//           selectedCategory={selectedCategory}
//           setSelectedCategory={setSelectedCategory}
//           selectedNewsType={selectedNewsType}
//           setSelectedNewsType={setSelectedNewsType}
//           selectedPriority={selectedPriority}
//           setSelectedPriority={setSelectedPriority}
//           selectedLocation={selectedLocation}
//           setSelectedLocation={setSelectedLocation}
//           locations={locations}
//           clearFilters={clearFilters}
//           applyFilters={applyFilters}
//         />
//       </SafeAreaView>
//     );
//   }

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
//       <FlatList
//         ref={flatListRef}
//         data={newsList}
//         renderItem={({ item }) => (
//           <NewsItem 
//             item={item}
//             formatTime={formatTime}
//             onFilterPress={() => setShowFilterModal(true)}
//             onCommentPress={handleCommentPress}
//             onVideoPlayback={handleVideoPlayback}
//             isVideoPlaying={currentVideoId === item.id}
//             currentNewsId={currentNewsId}
//             showComments={showComments}
//           />
//         )}
//         keyExtractor={(item) => item.id.toString()}
//         horizontal
//         pagingEnabled
//         showsHorizontalScrollIndicator={false}
//         onMomentumScrollEnd={handleSwipe}
//         initialScrollIndex={currentIndex}
//         getItemLayout={(_, index) => ({
//           length: SCREEN_WIDTH,
//           offset: SCREEN_WIDTH * index,
//           index,
//         })}
//         removeClippedSubviews={false}
//         windowSize={5}
//         maxToRenderPerBatch={3}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={handleRefresh}
//             colors={[pallette.primary]}
//             tintColor={pallette.primary}
//           />
//         }
//       />

//       <CommentsPanel 
//         showComments={showComments}
//         toggleComments={() => setShowComments(!showComments)}
//         currentNewsId={currentNewsId}
//       />
      
//       <FilterModal 
//         showFilterModal={showFilterModal}
//         setShowFilterModal={setShowFilterModal}
//         selectedCategory={selectedCategory}
//         setSelectedCategory={setSelectedCategory}
//         selectedNewsType={selectedNewsType}
//         setSelectedNewsType={setSelectedNewsType}
//         selectedPriority={selectedPriority}
//         setSelectedPriority={setSelectedPriority}
//         selectedLocation={selectedLocation}
//         setSelectedLocation={setSelectedLocation}
//         locations={locations}
//         clearFilters={clearFilters}
//         applyFilters={applyFilters}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: pallette.black,
//   },
//   emptyContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: pallette.black,
//     padding: 20,
//   },
//   emptyText: {
//     fontSize: 18,
//     fontFamily: medium,
//     color: pallette.white,
//     marginTop: 12,
//   },
//   locationText: {
//     fontSize: 14,
//     fontFamily: medium,
//     color: pallette.primary,
//     marginTop: 8,
//   },
//   errorText: {
//     fontSize: 14,
//     fontFamily: medium,
//     color: pallette.error,
//     marginTop: 8,
//   },
//   filterButtonEmpty: {
//     marginTop: 20,
//     backgroundColor: pallette.primary,
//     paddingHorizontal: 20,
//     paddingVertical: 10,
//     borderRadius: 8,
//   },
//   filterButtonEmptyText: {
//     color: pallette.white,
//     fontFamily: medium,
//   },
// });

// export default NewsViewScreen;
