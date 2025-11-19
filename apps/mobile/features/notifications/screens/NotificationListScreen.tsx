import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, CheckCheck, Bell, AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react-native';
import { useNotifications } from '~/hooks/useNotifications';
import { Notification } from '~/services/notificationService';
import { useLanguage } from '~/contexts/LanguageContext';

const NotificationListScreen: React.FC = () => {
  const router = useRouter();
  const { t } = useLanguage();
  const {
    notifications,
    unreadCount,
    loading,
    refreshing,
    error,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useNotifications();

  const handleNotificationPress = async (notification: Notification) => {
    try {
      if (!notification.leida) {
        await markAsRead(notification.id);
      }
      
      // Si tiene denuncia asociada, navegar al detalle
      if (notification.denuncia_id) {
        // Si tiene comentario_id, pasar como parámetro para hacer scroll
        if (notification.comentario_id) {
          router.push({
            pathname: '/(tabs)/report/[idReport]',
            params: { 
              idReport: notification.denuncia_id.toString(),
              comentarioId: notification.comentario_id.toString()
            }
          });
        } else {
          router.push({
            pathname: '/(tabs)/report/[idReport]',
            params: { idReport: notification.denuncia_id.toString() }
          });
        }
      }
    } catch (err) {
      console.error('Error al procesar notificación:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
    } catch (err) {
      console.error('Error al marcar todas como leídas:', err);
    }
  };

  const getIconByType = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      case 'warning':
        return <AlertCircle size={20} color="#F59E0B" />;
      default:
        return <Info size={20} color="#3B82F6" />;
    }
  };

  const getColorByType = (tipo: string) => {
    switch (tipo) {
      case 'success':
        return 'border-green-500/30 bg-green-500/10';
      case 'error':
        return 'border-red-500/30 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/10';
      default:
        return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  if (loading && notifications.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-[#090A0D]">
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#537CF2" />
          <Text className="text-white mt-4">{t('notifyListLoading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-[#090A0D]">
      <View className="bg-[#13161E] flex-row justify-between items-center p-4">
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <ArrowLeft size={26} color="white" />
        </TouchableOpacity>
        
        <Text className="text-[#537CF2] font-bold text-2xl">{t('notifyListTitle')}</Text>
        
        {unreadCount > 0 ? (
          <TouchableOpacity
            onPress={handleMarkAllRead}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <CheckCheck size={26} color="#537CF2" />
          </TouchableOpacity>
        ) : (
          <View className="w-[26px]" />
        )}
      </View>

      {unreadCount > 0 && (
        <View className="bg-[#13161E] mx-4 mt-3 p-3 rounded-lg flex-row items-center">
          <Bell size={18} color="#537CF2" />
          <Text className="text-white ml-2">
            {t('notifyListUnreadCount').replace('{count}', unreadCount.toString())}
          </Text>
        </View>
      )}

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshNotifications}
            tintColor="#537CF2"
          />
        }
      >
        {error && (
          <View className="bg-red-500/20 border border-red-500 mx-4 mt-4 p-4 rounded-lg">
            <Text className="text-red-500 text-center">{error}</Text>
          </View>
        )}

        {notifications.length === 0 ? (
          <View className="flex-1 justify-center items-center py-20">
            <Bell size={64} color="#4B5563" />
            <Text className="text-gray-400 text-lg mt-4">{t('notifyListEmpty')}</Text>
          </View>
        ) : (
          <View className="px-4 py-3">
            {notifications.map((notification: Notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => handleNotificationPress(notification)}
                className={`mb-3 rounded-lg border p-4 ${
                  notification.leida
                    ? 'bg-[#13161E] border-gray-700'
                    : `${getColorByType(notification.tipo)} border-2`
                }`}
                activeOpacity={0.7}
              >
                <View className="flex-row items-start">
                  <View className="mt-1">{getIconByType(notification.tipo)}</View>
                  
                  <View className="flex-1 ml-3">
                    <Text className={`text-base font-semibold ${
                      notification.leida ? 'text-gray-300' : 'text-white'
                    }`}>
                      {notification.titulo}
                    </Text>
                    
                    <Text className={`text-sm mt-1 ${
                      notification.leida ? 'text-gray-500' : 'text-gray-300'
                    }`}>
                      {notification.mensaje}
                    </Text>
                    
                    <Text className="text-xs text-gray-500 mt-2">
                      {notification.tiempo_transcurrido}
                    </Text>
                  </View>
                  
                  {!notification.leida && (
                    <View className="w-2 h-2 rounded-full bg-[#537CF2] ml-2 mt-2" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default NotificationListScreen;
