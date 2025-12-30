import React, { useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Keyboard,
  Platform
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome6';
import { pallette } from '../helpers/colors';
import { regular, medium, semibold } from '../helpers/fonts';

const CommentsPanel = ({
  showComments,
  toggleComments,
  comments,
  currentNewsId,
  counts,
  newComment,
  setNewComment,
  submitComment,
  formatTime
}) => {
  const commentInputRef = useRef(null);
  
  if (!showComments || !comments[currentNewsId]) return null;

  const handleSubmit = () => {
    submitComment();
    if (Platform.OS === 'ios') {
      commentInputRef.current?.blur();
    }
  };

  return (
    <View style={styles.commentsContainer}>
      <View style={styles.commentsHeader}>
        <Text style={styles.commentsTitle}>
          Comments ({counts[currentNewsId]?.comments || 0})
        </Text>
        <TouchableOpacity onPress={toggleComments}>
          <Icon name="xmark" size={20} color={pallette.grey} />
        </TouchableOpacity>
      </View>
      
      <ScrollView 
        style={styles.commentsList}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true}
      >
        {comments[currentNewsId].map((item) => (
          <View key={item.id} style={styles.commentItem}>
            <View style={styles.commentAvatar}>
              <Text style={styles.commentAvatarText}>
                {item.user.charAt(0)}
              </Text>
            </View>
            <View style={styles.commentContent}>
              <View style={styles.commentHeader}>
                <Text style={styles.commentUserName}>{item.user}</Text>
                <Text style={styles.commentTime}>{formatTime(item.time)}</Text>
              </View>
              <Text style={styles.commentText}>{item.text}</Text>
            </View>
          </View>
        ))}
        
        {comments[currentNewsId].length === 0 && (
          <View style={styles.noCommentsContainer}>
            <Icon name="comment-slash" size={40} color={pallette.grey} />
            <Text style={styles.noCommentsText}>No comments yet</Text>
          </View>
        )}
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
          blurOnSubmit={false}
          onSubmitEditing={handleSubmit}
          returnKeyType="default"
          maxLength={500}
        />
        <TouchableOpacity 
          style={[styles.submitButton, !newComment.trim() && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!newComment.trim()}
        >
          <Icon name="paper-plane" size={18} color={pallette.white} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  commentsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: pallette.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
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
    maxHeight: '70%',
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
    fontFamily: 'bold',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  noCommentsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    fontFamily: medium,
    color: pallette.darkgrey,
    marginTop: 12,
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
    maxHeight: 100,
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
});

export default CommentsPanel;