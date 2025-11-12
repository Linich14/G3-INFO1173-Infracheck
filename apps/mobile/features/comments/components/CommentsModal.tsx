import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Send, UserCircle2, CheckCircle2, XCircle } from 'lucide-react-native';
import { Comment, CommentsModalProps } from '../types';
import { createComment, getComments } from '../services/commentsService';
import { getToken } from '~/features/auth/services/authService';
import * as Haptics from 'expo-haptics';

const CommentsModal: React.FC<CommentsModalProps> = ({
  visible,
  onClose,
  postTitle,
  reportId,
  comments: initialComments,
  onAddComment,
  onRefreshComments,
}) => {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [isLoading, setIsLoading] = useState(false);
  const [emptyMessage, setEmptyMessage] = useState('No hay comentarios aún.\n¡Sé el primero en comentar!');
  
  // Estado para el toast local
  const [localToast, setLocalToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'error';
  }>({ visible: false, message: '', type: 'success' });
  
  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(-20)).current;

  // Función para mostrar toast local
  const showLocalToast = (message: string, type: 'success' | 'error') => {
    setLocalToast({ visible: true, message, type });
    
    // Animación de entrada
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(toastTranslateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
    ]).start();

    // Auto-hide después de 3 segundos
    setTimeout(() => {
      hideLocalToast();
    }, 3000);
  };

  const hideLocalToast = () => {
    Animated.parallel([
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(toastTranslateY, {
        toValue: -20,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setLocalToast({ visible: false, message: '', type: 'success' });
    });
  };

  // Actualizar comentarios cuando cambian las props
  useEffect(() => {
    setComments(initialComments);
  }, [initialComments]);

  // Cargar comentarios del backend cuando el modal se abre
  useEffect(() => {
    if (visible && reportId) {
      loadComments();
    }
  }, [visible, reportId]);

  const loadComments = async () => {
    try {
      setIsLoading(true);
      const token = await getToken();
      
      if (!token) {
        showLocalToast('Debes iniciar sesión para ver los comentarios', 'error');
        return;
      }

      const response = await getComments(reportId, token);
      
      // Guardar el mensaje de comentarios vacíos si existe
      if (response.message) {
        setEmptyMessage(response.message);
      }
      
      // Transformar los comentarios del backend al formato local
      const transformedComments: Comment[] = response.comentarios.map(comment => ({
        id: comment.id,
        author: comment.usuario.nickname,
        content: comment.comentario,
        timeAgo: comment.tiempo_relativo,
        usuario: comment.usuario,
        puede_eliminar: comment.puede_eliminar,
        es_autor: comment.es_autor,
        es_admin: comment.es_admin,
      }));

      setComments(transformedComments);
    } catch (error: any) {
      console.error('Error loading comments:', error);
      showLocalToast(error.message || 'Error al cargar comentarios', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!commentText.trim() || isSubmitting) return;

    // Validar longitud del comentario
    if (commentText.trim().length > 1000) {
      showLocalToast('El comentario no puede exceder los 1000 caracteres', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await getToken();
      
      if (!token) {
        showLocalToast('Debes iniciar sesión para comentar', 'error');
        return;
      }

      // Enviar comentario al backend
      const response = await createComment(reportId, commentText.trim(), token);
      
      // Agregar el nuevo comentario a la lista local
      const newComment: Comment = {
        id: response.comentario.id,
        author: response.comentario.usuario.nickname,
        content: response.comentario.comentario,
        timeAgo: response.comentario.tiempo_relativo,
        usuario: response.comentario.usuario,
        puede_eliminar: response.comentario.puede_eliminar,
        es_autor: response.comentario.es_autor,
        es_admin: response.comentario.es_admin,
      };

      setComments(prev => [newComment, ...prev]);
      setCommentText('');
      
      // Feedback háptico de éxito
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showLocalToast('¡Comentario publicado!', 'success');
      
      // Llamar al callback si existe
      await onAddComment(commentText.trim());
      
      // Refrescar comentarios si hay callback
      if (onRefreshComments) {
        onRefreshComments();
      }
    } catch (error: any) {
      console.error('Error creating comment:', error);
      showLocalToast(error.message || 'Error al publicar el comentario', 'error');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
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
            {isLoading ? (
              <View className="flex-1 items-center justify-center py-12">
                <ActivityIndicator size="large" color="#537CF2" />
                <Text className="text-gray-400 text-center text-base mt-4">
                  Cargando comentarios...
                </Text>
              </View>
            ) : comments.length === 0 ? (
              <View className="flex-1 items-center justify-center py-12">
                <Text className="text-gray-400 text-center text-base">
                  {emptyMessage}
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
                  editable={!isSubmitting}
                  maxLength={1000}
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
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Send
                    size={20}
                    color={commentText.trim() && !isSubmitting ? '#fff' : '#9ca3af'}
                  />
                )}
              </TouchableOpacity>
            </View>
            {/* Contador de caracteres */}
            {commentText.length > 800 && (
              <Text className={`text-xs mt-2 text-right ${
                commentText.length > 1000 ? 'text-red-500' : 'text-gray-400'
              }`}>
                {commentText.length}/1000
              </Text>
            )}
          </View>
        </KeyboardAvoidingView>

        {/* Toast local dentro del modal */}
        {localToast.visible && (
          <Animated.View
            style={{
              position: 'absolute',
              top: 20,
              left: 20,
              right: 20,
              zIndex: 10000,
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            }}
          >
            <View
              className={`${
                localToast.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
              } flex-row items-center rounded-2xl border-2 ${
                localToast.type === 'success' ? 'border-emerald-400' : 'border-red-400'
              } px-5 py-4 shadow-2xl`}
              style={{
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 10,
              }}
            >
              <View className="mr-3">
                {localToast.type === 'success' ? (
                  <CheckCircle2 size={24} color="#fff" />
                ) : (
                  <XCircle size={24} color="#fff" />
                )}
              </View>
              <Text className="flex-1 text-base font-semibold text-white">
                {localToast.message}
              </Text>
            </View>
          </Animated.View>
        )}
      </SafeAreaView>
    </Modal>
  );
};

export default CommentsModal;