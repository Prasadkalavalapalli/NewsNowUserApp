import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  FlatList,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold, bold } from '../helpers/fonts';
import Loader from '../helpers/loader';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const NewsViewScreen = () => {
  // Refs
  const flatListRef = useRef(null);
  const commentInputRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newsList, setNewsList] = useState([]);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [saved, setSaved] = useState({});
  const [shares, setShares] = useState({});

  // Initial data load
  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // In production, replace with API call
      const mockNews = generateMockNews();
      setNewsList(mockNews);
      
      // Initialize states for each news item
      initializeNewsStates(mockNews);
    } catch (error) {
      console.error('Error initializing data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockNews = () => {
    return [
      {
        id: 1,
        headline: 'Breaking: Major Tech Conference Announced',
        description: 'The annual tech conference will feature top industry leaders discussing future technologies.',
        image: 'https://picsum.photos/400/300?random=1',
        category: 'Technology',
        time: '2 hours ago',
        content: 'The annual tech conference will bring together innovators, entrepreneurs, and tech enthusiasts from around the globe. Keynote speakers include CEOs from leading tech companies who will share insights on AI, blockchain, and sustainable technology.',
        initialLikes: 245,
        initialComments: 42,
        initialShares: 18,
      },
      {
        id: 2,
        headline: 'Stock Markets Reach All Time High',
        description: 'Global markets surge as economic recovery accelerates worldwide.',
        image: 'https://picsum.photos/400/300?random=2',
        category: 'Finance',
        time: '4 hours ago',
        content: 'Stock markets worldwide have reached unprecedented levels, driven by strong corporate earnings and positive economic indicators. Analysts predict continued growth in the coming quarters.',
        initialLikes: 189,
        initialComments: 31,
        initialShares: 24,
      },
      {
        id: 3,
        headline: 'New Environmental Policies Announced',
        description: 'Government unveils new green initiatives for sustainable development.',
        image: 'https://picsum.photos/400/300?random=3',
        category: 'Environment',
        time: '1 day ago',
        content: 'The government has announced a comprehensive environmental policy aimed at reducing carbon emissions by 50% by 2030. The plan includes investments in renewable energy and stricter regulations for industries.',
        initialLikes: 312,
        initialComments: 56,
        initialShares: 45,
      },
    ];
  };

  const initializeNewsStates = (newsData) => {
    const initialComments = {};
    const initialLikes = {};
    const initialSaved = {};
    const initialShares = {};
    
    newsData.forEach(news => {
      initialComments[news.id] = [
        { id: 1, user: 'John Doe', text: 'Great news! Looking forward to this.', time: '1 hour ago' },
        { id: 2, user: 'Sarah Smith', text: 'Finally some positive development!', time: '2 hours ago' },
      ];
      initialLikes[news.id] = { count: news.initialLikes, liked: false };
      initialSaved[news.id] = false;
      initialShares[news.id] = { count: news.initialShares };
    });
    
    setComments(initialComments);
    setLikes(initialLikes);
    setSaved(initialSaved);
    setShares(initialShares);
  };

  // Current news data
  const currentNews = newsList[currentIndex] || {};
  const currentNewsId = currentNews.id;

  // Navigation handlers
  const handleBackPress = () => {
    // navigation.goBack(); // Uncomment when navigation is available
  };

  const handleSwipe = (event) => {
    const contentOffsetX = event.nativeEvent.contentOffset.x;
    const index = Math.round(contentOffsetX / SCREEN_WIDTH);
    setCurrentIndex(index);
    setShowComments(false);
  };

  const goToNews = (index) => {
    if (index >= 0 && index < newsList.length) {
      flatListRef.current?.scrollToIndex({
        index,
        animated: true,
      });
      setCurrentIndex(index);
      setShowComments(false);
    }
  };

  const goToNextNews = () => goToNews(currentIndex + 1);
  const goToPrevNews = () => goToNews(currentIndex - 1);

  // Interaction handlers
  const toggleLike = () => {
    if (!currentNewsId) return;
    
    setLikes(prev => ({
      ...prev,
      [currentNewsId]: {
        count: prev[currentNewsId].liked ? prev[currentNewsId].count - 1 : prev[currentNewsId].count + 1,
        liked: !prev[currentNewsId].liked
      }
    }));
  };

  const toggleSave = () => {
    if (!currentNewsId) return;
    
    setSaved(prev => ({
      ...prev,
      [currentNewsId]: !prev[currentNewsId]
    }));
  };

  const incrementShare = () => {
    if (!currentNewsId) return;
    
    setShares(prev => ({
      ...prev,
      [currentNewsId]: {
        count: prev[currentNewsId].count + 1
      }
    }));
    // TODO: Implement native share dialog
  };

  const toggleComments = () => {
    setShowComments(!showComments);
  };

  const submitComment = () => {
    if (!currentNewsId || newComment.trim() === '') return;
    
    const newCommentObj = {
      id: Date.now(),
      user: 'You',
      text: newComment.trim(),
      time: 'Just now'
    };
    
    setComments(prev => ({
      ...prev,
      [currentNewsId]: [newCommentObj, ...prev[currentNewsId]]
    }));
    
    setNewComment('');
    commentInputRef.current?.blur();
  };

  // Component: Comments Panel
  const CommentsPanel = () => {
    if (!showComments || !comments[currentNewsId]) return null;

    return (
      <View style={styles.commentsContainer}>
        <View style={styles.commentsHeader}>
          <Text style={styles.commentsTitle}>
            Comments ({comments[currentNewsId].length})
          </Text>
          <TouchableOpacity onPress={toggleComments}>
            <Icon name="xmark" size={20} color={pallette.grey} />
          </TouchableOpacity>
        </View>
        
       {/* Comments List */}
<ScrollView 
  style={styles.commentsList}
  showsVerticalScrollIndicator={false}
>
  {comments[currentNewsId].map((item) => (
    <View key={item.id.toString()} style={styles.commentItem}>
      <View style={styles.commentUser}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.user.charAt(0)}
          </Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentUserName}>{item.user}</Text>
            <Text style={styles.commentTime}>{item.time}</Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </View>
    </View>
  ))}
</ScrollView>
        
        <View style={styles.addCommentContainer}>
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            placeholder="Write a comment..."
            value={newComment}
            onChangeText={setNewComment}
            multiline
            placeholderTextColor={pallette.grey}
            maxLength={500}
          />
          <TouchableOpacity 
            style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
            onPress={submitComment}
            disabled={!newComment.trim()}
          >
            <Icon name="paper-plane" size={18} color={pallette.white} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Component: Action Bar
  const ActionBar = ({ newsId }) => (
    <View style={styles.actionBar}>
      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={toggleLike}
      >
        <Icon 
          name="heart" 
          size={22} 
          solid={likes[newsId]?.liked}
          color={likes[newsId]?.liked ? pallette.red : pallette.darkgrey} 
        />
        <Text style={[
          styles.actionCount,
          likes[newsId]?.liked && styles.likedText
        ]}>
          {likes[newsId]?.count || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={toggleComments}
      >
        <Icon 
          name="comment" 
          size={22} 
          color={showComments && currentNewsId === newsId ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={[
          styles.actionCount,
          showComments && currentNewsId === newsId && styles.activeText
        ]}>
          {comments[newsId]?.length || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={incrementShare}
      >
        <Icon name="share" size={22} color={pallette.darkgrey} />
        <Text style={styles.actionCount}>
          {shares[newsId]?.count || 0}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.actionButton} 
        onPress={toggleSave}
      >
        <Icon 
          name="bookmark" 
          size={22} 
          solid={saved[newsId]}
          color={saved[newsId] ? pallette.primary : pallette.darkgrey} 
        />
        <Text style={styles.actionText}>Save</Text>
      </TouchableOpacity>
    </View>
  );

  // Component: News Item
  const NewsItem = ({ item }) => (
    <View style={styles.newsContainer}>
      {/* Header with Image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.newsImage} />
        <View style={styles.imageOverlay} />
        
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Icon name="arrow-left" size={24} color={pallette.white} />
        </TouchableOpacity>

        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView 
        style={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headline}>{item.headline}</Text>
        <Text style={styles.time}>{item.time}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.fullContent}>{item.content}</Text>
        <View style={styles.contentSpacer} />
      </ScrollView>

      <ActionBar newsId={item.id} />
    </View>
  );

  // Component: Navigation Dots
  const NavigationDots = () => (
    <View style={styles.dotsContainer}>
      {newsList.map((_, index) => (
        <View
          key={index}
          style={[
            styles.dot,
            index === currentIndex && styles.activeDot,
          ]}
        />
      ))}
    </View>
  );

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // Empty state
  if (newsList.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={pallette.black} />
        <View style={styles.emptyContainer}>
          <Icon name="newspaper" size={60} color={pallette.grey} />
          <Text style={styles.emptyText}>No news available</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* News Carousel */}
        <FlatList
          ref={flatListRef}
          data={newsList}
          renderItem={NewsItem}
          keyExtractor={(item) => item.id.toString()}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleSwipe}
          initialScrollIndex={currentIndex}
          getItemLayout={(_, index) => ({
            length: SCREEN_WIDTH,
            offset: SCREEN_WIDTH * index,
            index,
          })}
          onScrollToIndexFailed={() => {
            setTimeout(() => {
              flatListRef.current?.scrollToIndex({
                index: currentIndex,
                animated: true,
              });
            }, 100);
          }}
        />

        {/* Navigation Indicators */}
        <NavigationDots />
        
        {/* Swipe Hint */}
        {!showComments && (
          <View style={styles.swipeHint}>
            <Icon name="arrows-left-right" size={16} color={pallette.white} />
            <Text style={styles.swipeHintText}>Swipe for more news</Text>
          </View>
        )}

        {/* Comments Panel */}
        <CommentsPanel />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: pallette.black,
  },
  keyboardView: {
    flex: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: pallette.black,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: medium,
    color: pallette.white,
    marginTop: 12,
    textAlign: 'center',
  },
  newsContainer: {
    width: SCREEN_WIDTH,
    flex: 1,
  },
  imageContainer: {
    height: SCREEN_HEIGHT * 0.35,
    position: 'relative',
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  categoryBadge: {
    position: 'absolute',
    top: 40,
    right: 20,
    backgroundColor: pallette.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    zIndex: 1,
  },
  categoryText: {
    color: pallette.white,
    fontSize: 12,
    fontFamily: bold,
    textTransform: 'uppercase',
  },
  contentContainer: {
    flex: 1,
    backgroundColor: pallette.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 20,
    marginTop: -20,
  },
  headline: {
    fontSize: 24,
    fontFamily: bold,
    color: pallette.black,
    marginBottom: 8,
    lineHeight: 32,
  },
  time: {
    fontSize: 14,
    fontFamily: medium,
    color: pallette.grey,
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.black,
    lineHeight: 24,
    marginBottom: 16,
  },
  fullContent: {
    fontSize: 15,
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: 22,
  },
  contentSpacer: {
    height: 80,
  },
  // Action Bar
  actionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: pallette.white,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
    paddingVertical: 4,
  },
  actionCount: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 4,
  },
  actionText: {
    fontSize: 12,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 4,
  },
  likedText: {
    color: pallette.red,
  },
  activeText: {
    color: pallette.primary,
  },
  // Comments
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  commentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentsTitle: {
    fontSize: 18,
    fontFamily: semibold,
    color: pallette.black,
  },
  commentsList: {
    maxHeight: SCREEN_HEIGHT * 0.4,
    paddingHorizontal: 20,
  },
  commentItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: pallette.lightgrey,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  commentAvatarText: {
    color: pallette.white,
    fontSize: 16,
    fontFamily: bold,
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  commentUserName: {
    fontSize: 14,
    fontFamily: semibold,
    color: pallette.black,
  },
  commentTime: {
    fontSize: 12,
    fontFamily: regular,
    color: pallette.grey,
  },
  commentText: {
    fontSize: 14,
    fontFamily: regular,
    color: pallette.darkgrey,
    lineHeight: 20,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: pallette.lightgrey,
  },
  commentInput: {
    flex: 1,
    backgroundColor: pallette.lightgrey,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: regular,
    color: pallette.black,
    maxHeight: 80,
    marginRight: 12,
  },
  submitButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: pallette.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: pallette.grey,
  },
  // Navigation
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: pallette.white,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  swipeHint: {
    position: 'absolute',
    bottom: 60,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  swipeHintText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    fontFamily: regular,
  },
});

export default NewsViewScreen;