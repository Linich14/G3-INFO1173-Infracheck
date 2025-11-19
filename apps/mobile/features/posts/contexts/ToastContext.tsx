import React, { createContext, useContext, useState, useCallback } from 'react';
import VoteToast from '../components/VoteToast';
import * as Haptics from 'expo-haptics';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error' | 'info' | 'vote' | 'unvote';
}

interface ToastContextValue {
  showVote: (message: string) => void;
  showUnvote: (message: string) => void;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
  });

  const showVote = useCallback((message: string) => {
    setToast({
      visible: true,
      message,
      type: 'vote',
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const showUnvote = useCallback((message: string) => {
    setToast({
      visible: true,
      message,
      type: 'unvote',
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({
      visible: true,
      message,
      type: 'success',
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }, []);

  const showError = useCallback((message: string) => {
    setToast({
      visible: true,
      message,
      type: 'error',
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  }, []);

  const showInfo = useCallback((message: string) => {
    setToast({
      visible: true,
      message,
      type: 'info',
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({ ...prev, visible: false }));
  }, []);

  return (
    <ToastContext.Provider
      value={{
        showVote,
        showUnvote,
        showSuccess,
        showError,
        showInfo,
      }}
    >
      {children}
      <VoteToast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
