import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, UserCircle2 } from 'lucide-react-native';
import { Comment, CommentsModalProps } from '../types';

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postTitle,
  comments,
  onAddComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(commentText.trim());
      setCommentText('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderComment = (comment: Comment) => (
    <View key={comment.id} className="mb-4 bg-[#0f172a] rounded-lg p-3">
      <View className="flex-row items-center mb-2">
        <UserCircle2 size={24} color="#537CF2" />
        <Text className="text-white font-semibold ml-2 flex-1">{comment.author}</Text>
        <Text className="text-gray-400 text-sm">{comment.timeAgo}</Text>
      </View>
      <Text className="text-white text-base leading-5">{comment.content}</Text>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#090A0D' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header */}
          <View className="bg-[#13161E] flex-row items-center justify-between p-4 border-b border-gray-700">
            <View className="flex-1">
              <Text className="text-[#537CF2] font-bold text-lg">Comentarios</Text>
              <Text className="text-gray-400 text-sm mt-1" numberOfLines={1}>
                {postTitle}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onClose}
              className="ml-4 p-2"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{
              paddingVertical: 16,
              paddingBottom: 20,
            }}
            showsVerticalScrollIndicator={false}
          >
            {comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-gray-400 text-center text-base">
                  No hay comentarios aún.{'\n'}¡Sé el primero en comentar!
                </Text>
              </View>
            ) : (
              comments.map(renderComment)
            )}
          </ScrollView>

          {/* Comment Input */}
          <View className="bg-[#13161E] border-t border-gray-700 p-4">
            <View className="flex-row items-end gap-3">
              <View className="flex-1 bg-[#0f172a] rounded-lg border border-gray-600 min-h-[44px] max-h-[120px]">
                <TextInput
                  value={commentText}
                  onChangeText={setCommentText}
                  placeholder="Escribe un comentario..."
                  placeholderTextColor="#6b7280"
                  multiline
                  textAlignVertical="top"
                  style={{
                    color: 'white',
                    fontSize: 16,
                    padding: 12,
                    minHeight: 44,
                    maxHeight: 120,
                  }}
                  returnKeyType="default"
                  blurOnSubmit={false}
                />
              </View>
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={!commentText.trim() || isSubmitting}
                className={`w-12 h-12 rounded-full items-center justify-center ${
                  commentText.trim() && !isSubmitting
                    ? 'bg-[#537CF2]'
                    : 'bg-gray-600'
                }`}
              >
                <Send
                  size={20}
                  color={commentText.trim() && !isSubmitting ? '#fff' : '#9ca3af'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
};

export default CommentsModal;