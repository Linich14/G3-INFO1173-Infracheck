import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type Locale = 'es' | 'en';

const STORAGE_KEY = 'app_locale';

const TRANSLATIONS: Record<Locale, {
  settings: string;
  account: string;
  notifications: string;
  language: string;
  appearance: string;
  spanish: string;
  english: string;
  profileTitle: string;
  // Profile / User info
  profileLoading: string;
  profileLoadError: string;
  back: string;
  retry: string;
  changePasswordTitle: string;
  changePasswordSubtitle: string;
  changePasswordModalTitle: string;
  changePasswordModalBody: string;
  currentPasswordPlaceholder: string;
  newPasswordPlaceholder: string;
  confirmNewPasswordPlaceholder: string;
  passwordRequirementsTitle: string;
  passwordReqLength: string;
  passwordReqUppercase: string;
  passwordReqNumber: string;
  passwordReqNoSpecial: string;
  passwordsMatch: string;
  passwordsDoNotMatch: string;
  cancel: string;
  change: string;
  deleteAccountTitle: string;
  deleteAccountSubtitle: string;
  deleteAccountConfirmTitle: string;
  deleteAccountConfirmBody: string;
  deleteAccountSecondTitle: string;
  deleteAccountSecondBody: string;
  deleteAccountConfirmPlaceholder: string;
  deleteAccountButton: string;
  continue: string;
  nameFieldPlaceholder: string;
  statsLoading: string;
  statsRetry: string;
  statsTitle: string;
  statsReportsCreated: string;
  statsReportsFollowed: string;
  statsVotesReceived: string;
  statsVotesMade: string;
  editEmailTitle: string;
  editEmailLabel: string;
  editEmailPlaceholder: string;
  saving: string;
  save: string;
  editPhoneTitle: string;
  editPhoneLabel: string;
  editPhoneHint: string;
  editPhonePlaceholder: string;
  editNameTitle: string;
  firstNameLabel: string;
  lastNameLabel: string;
  // Auth / Welcome
  welcomeTitle: string;
  welcomeRegister: string;
  welcomeLogin: string;
  loginTitle: string;
  loginHello: string;
  loginUserLabel: string;
  loginPasswordLabel: string;
  loginForgotPassword: string;
  loginSubmitting: string;
  loginSuccess: string;
  loginErrorClose: string;
  loginEmptyFieldsError: string;
  loginErrorPrefix: string;
  loginErrorFallback: string;
  registerTitle: string;
  registerHello: string;
  registerRutLabel: string;
  registerUsernameLabel: string;
  registerEmailLabel: string;
  registerPasswordLabel: string;
  registerRepeatPasswordLabel: string;
  registerPhoneLabel: string;
  registerPhonePrefix: string;
  registerHaveAccount: string;
  registerSubmitting: string;
  registerSuccess: string;
  registerErrorPrefix: string;
  registerUsernameRequired: string;
  registerPhoneInvalid: string;
  recoverTitle: string;
  recoverHeaderQuestion: string;
  recoverSelectMethod: string;
  recoverMethodRut: string;
  recoverMethodEmail: string;
  recoverButtonSending: string;
  recoverButton: string;
  recoverSendingCodeTitle: string;
  recoverSendingCodeBody: string;
  recoverCodeSentTitle: string;
  recoverErrorTitle: string;
  recoverModalUnderstand: string;
  recoverFieldRequired: string;
  recoverConnectionError: string;
  verifyTitle: string;
  verifyHeaderTitle: string;
  verifyCodeSentTo: string;
  verifyCodePlaceholder: string;
  verifyCodeHint: string;
  verifyButtonVerifying: string;
  verifyButton: string;
  verifyResendQuestion: string;
  verifyResendLink: string;
  verifyModalVerifyingTitle: string;
  verifyModalVerifyingBody: string;
  verifyModalSuccessTitle: string;
  verifyModalErrorTitle: string;
  verifyModalRetry: string;
  resetTitle: string;
  resetHeaderAlmost: string;
  resetInfoTitle: string;
  resetInfoBody: string;
  resetNewPasswordLabel: string;
  resetConfirmPasswordLabel: string;
  resetButtonUpdating: string;
  resetButton: string;
  resetModalUpdatingTitle: string;
  resetModalUpdatingBody: string;
  resetModalSuccessTitle: string;
  resetModalRedirectHint: string;
  resetModalErrorTitle: string;
  resetModalRetry: string;
  emailPlaceholder: string;
  emailErrorDefault: string;
  rutPlaceholder: string;
  rutErrorDefault: string;
}> = {
  es: {
    settings: 'Ajustes',
    account: 'Cuenta',
    notifications: 'Notificaciones',
    language: 'Idioma',
    appearance: 'Apariencia',
    spanish: 'Español',
    english: 'Inglés',
    profileTitle: 'Perfil de usuario',
    profileLoading: 'Cargando perfil...',
    profileLoadError: 'Error al cargar el perfil',
    back: 'Volver',
    retry: 'Reintentar',
    changePasswordTitle: 'Cambiar Contraseña',
    changePasswordSubtitle: 'Actualiza tu contraseña de forma segura',
    changePasswordModalTitle: 'Cambiar Contraseña',
    changePasswordModalBody: 'Ingresa tu contraseña actual y la nueva contraseña que deseas usar.',
    currentPasswordPlaceholder: 'Contraseña actual',
    newPasswordPlaceholder: 'Nueva contraseña',
    confirmNewPasswordPlaceholder: 'Confirmar nueva contraseña',
    passwordRequirementsTitle: 'Requisitos de contraseña:',
    passwordReqLength: 'Entre 8 y 16 caracteres',
    passwordReqUppercase: 'Al menos una mayúscula',
    passwordReqNumber: 'Al menos un número',
    passwordReqNoSpecial: 'Solo letras y números',
  passwordsMatch: 'Las contraseñas coinciden',
  passwordsDoNotMatch: 'Las contraseñas no coinciden',
    cancel: 'Cancelar',
    change: 'Cambiar',
    deleteAccountTitle: 'Eliminar Cuenta',
    deleteAccountSubtitle: 'Acción irreversible - Contacta soporte para recuperar',
    deleteAccountConfirmTitle: '¿Eliminar Cuenta?',
    deleteAccountConfirmBody:
      'Esta acción desactivará tu cuenta permanentemente y es irreversible desde la aplicación.\n\nPerderás acceso a todos tus datos y no podrás iniciar sesión.\n\nPara reactivar, deberás contactar directamente con soporte técnico.',
    deleteAccountSecondTitle: 'Confirmar Eliminación',
    deleteAccountSecondBody:
      'Para confirmar la eliminación permanente de tu cuenta, escribe "ELIMINAR" en el campo abajo:',
    deleteAccountConfirmPlaceholder: 'Escribe ELIMINAR',
    deleteAccountButton: 'Eliminar Cuenta',
    continue: 'Continuar',
    nameFieldPlaceholder: 'Agrega tu nombre y apellido para completar tu perfil',
    statsLoading: 'Cargando estadísticas...',
    statsRetry: 'Reintentar',
    statsTitle: 'Actividad',
    statsReportsCreated: 'Reportes creados',
    statsReportsFollowed: 'Reportes seguidos',
    statsVotesReceived: 'Votos recibidos',
    statsVotesMade: 'Votos realizados',
    editEmailTitle: 'Editar Email',
    editEmailLabel: 'Nuevo email',
    editEmailPlaceholder: 'ejemplo@correo.com',
    saving: 'Guardando...',
    save: 'Guardar',
    editPhoneTitle: 'Editar Teléfono',
    editPhoneLabel: 'Nuevo teléfono',
    editPhoneHint: 'Ingresa solo los 8 dígitos finales (automáticamente se agrega +56 9)',
    editPhonePlaceholder: '1234 5678',
    editNameTitle: 'Editar nombre',
    firstNameLabel: 'Nombre',
    lastNameLabel: 'Apellido',
    welcomeTitle: 'Bienvenidos',
    welcomeRegister: 'Registrarse',
    welcomeLogin: 'Iniciar Sesión',
    loginTitle: 'Inicio Sesión',
    loginHello: 'Hola!',
    loginUserLabel: 'Usuario',
    loginPasswordLabel: 'Contraseña',
    loginForgotPassword: '¿Olvidaste tu contraseña?',
    loginSubmitting: 'Iniciando sesión...',
    loginSuccess: '¡Inicio de sesión exitoso!',
    loginErrorClose: 'Cerrar',
  loginEmptyFieldsError: 'Por favor, completa todos los campos.',
  loginErrorPrefix: 'Error al iniciar sesión: ',
  loginErrorFallback: 'Verifica tus credenciales.',
    registerTitle: 'Registrarse',
    registerHello: 'Hola!',
    registerRutLabel: 'RUT',
    registerUsernameLabel: 'Nombre de Usuario',
    registerEmailLabel: 'Correo Electrónico',
    registerPasswordLabel: 'Contraseña',
    registerRepeatPasswordLabel: 'Repetir Contraseña',
    registerPhoneLabel: 'Teléfono',
    registerPhonePrefix: '+569',
    registerHaveAccount: 'Ya tengo cuenta',
    registerSubmitting: 'Registrando usuario...',
    registerSuccess: '¡Registro exitoso! Serás redirigido al inicio de sesión.',
    registerErrorPrefix: 'Error en el registro: ',
  registerUsernameRequired: 'Usuario requerido',
  registerPhoneInvalid: 'Teléfono inválido',
    recoverTitle: 'Recuperar Contraseña',
    recoverHeaderQuestion: '¿Olvidaste tu\ncontraseña?',
    recoverSelectMethod: 'Selecciona cómo buscar tu cuenta',
    recoverMethodRut: 'RUT',
    recoverMethodEmail: 'Email',
    recoverButtonSending: 'Enviando...',
    recoverButton: 'Recuperar',
    recoverSendingCodeTitle: 'Enviando código...',
    recoverSendingCodeBody: 'Por favor espera mientras procesamos tu solicitud',
    recoverCodeSentTitle: '¡Código enviado!',
    recoverErrorTitle: 'Error',
    recoverModalUnderstand: 'Entendido',
  recoverFieldRequired: 'Por favor, completa el campo requerido.',
  recoverConnectionError: 'Error de conexión. Verifica tu conexión a internet.',
    verifyTitle: 'Verificar Código',
    verifyHeaderTitle: 'Ingresa el\ncódigo',
    verifyCodeSentTo: 'Código enviado a:',
    verifyCodePlaceholder: '000000',
    verifyCodeHint: 'Ingresa los 6 dígitos del código',
    verifyButtonVerifying: 'Verificando...',
    verifyButton: 'Verificar Código',
    verifyResendQuestion: '¿No recibiste el código?',
    verifyResendLink: 'Enviar nuevamente',
    verifyModalVerifyingTitle: 'Verificando código...',
    verifyModalVerifyingBody: 'Por favor espera mientras validamos tu código',
    verifyModalSuccessTitle: '¡Código verificado!',
    verifyModalErrorTitle: 'Error',
    verifyModalRetry: 'Reintentar',
    resetTitle: 'Nueva Contraseña',
    resetHeaderAlmost: '¡Ya casi!',
    resetInfoTitle: 'Ingresa tu nueva contraseña',
    resetInfoBody: 'Debe cumplir con los requisitos de seguridad',
    resetNewPasswordLabel: 'Nueva Contraseña',
    resetConfirmPasswordLabel: 'Confirmar Contraseña',
    resetButtonUpdating: 'Actualizando...',
    resetButton: 'Cambiar Contraseña',
    resetModalUpdatingTitle: 'Actualizando contraseña...',
    resetModalUpdatingBody: 'Por favor espera mientras actualizamos tu contraseña',
    resetModalSuccessTitle: '¡Contraseña actualizada!',
    resetModalRedirectHint: 'Redirigiendo al inicio de sesión...',
    resetModalErrorTitle: 'Error',
    resetModalRetry: 'Reintentar',
    emailPlaceholder: 'usuarioinfracheck@correo.cl',
    emailErrorDefault: 'Ingresa un correo válido (ej: usuario@dominio.com)',
    rutPlaceholder: '12.345.678-k',
    rutErrorDefault: 'Ingresa un RUT válido (ej: 12.345.678-9)',
  },
  en: {
    settings: 'Settings',
    account: 'Account',
    notifications: 'Notifications',
    language: 'Language',
    appearance: 'Appearance',
    spanish: 'Spanish',
    english: 'English',
    profileTitle: 'User profile',
    profileLoading: 'Loading profile...',
    profileLoadError: 'Error loading profile',
    back: 'Back',
    retry: 'Retry',
    changePasswordTitle: 'Change Password',
    changePasswordSubtitle: 'Update your password securely',
    changePasswordModalTitle: 'Change Password',
    changePasswordModalBody: 'Enter your current password and the new password you want to use.',
    currentPasswordPlaceholder: 'Current password',
    newPasswordPlaceholder: 'New password',
    confirmNewPasswordPlaceholder: 'Confirm new password',
    passwordRequirementsTitle: 'Password requirements:',
    passwordReqLength: 'Between 8 and 16 characters',
    passwordReqUppercase: 'At least one uppercase letter',
    passwordReqNumber: 'At least one number',
    passwordReqNoSpecial: 'Letters and numbers only',
  passwordsMatch: 'Passwords match',
  passwordsDoNotMatch: 'Passwords do not match',
    cancel: 'Cancel',
    change: 'Change',
    deleteAccountTitle: 'Delete Account',
    deleteAccountSubtitle: 'Irreversible action - Contact support to recover',
    deleteAccountConfirmTitle: 'Delete Account?',
    deleteAccountConfirmBody:
      'This action will permanently deactivate your account and is irreversible from the app.\n\nYou will lose access to all your data and will not be able to log in.\n\nTo reactivate, you must contact support directly.',
    deleteAccountSecondTitle: 'Confirm Deletion',
    deleteAccountSecondBody:
      'To confirm permanent deletion of your account, type "ELIMINAR" in the field below:',
    deleteAccountConfirmPlaceholder: 'Type ELIMINAR',
    deleteAccountButton: 'Delete Account',
    continue: 'Continue',
    nameFieldPlaceholder: 'Add your first and last name to complete your profile',
    statsLoading: 'Loading stats...',
    statsRetry: 'Retry',
    statsTitle: 'Activity',
    statsReportsCreated: 'Reports created',
    statsReportsFollowed: 'Reports followed',
    statsVotesReceived: 'Votes received',
    statsVotesMade: 'Votes made',
    editEmailTitle: 'Edit Email',
    editEmailLabel: 'New email',
    editEmailPlaceholder: 'example@mail.com',
    saving: 'Saving...',
    save: 'Save',
    editPhoneTitle: 'Edit Phone',
    editPhoneLabel: 'New phone',
    editPhoneHint: 'Enter only the last 8 digits (prefix +56 9 is added automatically)',
    editPhonePlaceholder: '1234 5678',
    editNameTitle: 'Edit name',
    firstNameLabel: 'First name',
    lastNameLabel: 'Last name',
    welcomeTitle: 'Welcome',
    welcomeRegister: 'Sign up',
    welcomeLogin: 'Log in',
    loginTitle: 'Log in',
    loginHello: 'Hi!',
    loginUserLabel: 'User',
    loginPasswordLabel: 'Password',
    loginForgotPassword: 'Forgot your password?',
    loginSubmitting: 'Signing in...',
    loginSuccess: 'Login successful!',
    loginErrorClose: 'Close',
  loginEmptyFieldsError: 'Please fill in all fields.',
  loginErrorPrefix: 'Error signing in: ',
  loginErrorFallback: 'Check your credentials.',
    registerTitle: 'Sign up',
    registerHello: 'Hi!',
    registerRutLabel: 'RUT',
    registerUsernameLabel: 'Username',
    registerEmailLabel: 'Email',
    registerPasswordLabel: 'Password',
    registerRepeatPasswordLabel: 'Repeat password',
    registerPhoneLabel: 'Phone',
    registerPhonePrefix: '+569',
    registerHaveAccount: 'I already have an account',
    registerSubmitting: 'Registering user...',
    registerSuccess: 'Registration successful! You will be redirected to login.',
    registerErrorPrefix: 'Registration error: ',
  registerUsernameRequired: 'Username is required',
  registerPhoneInvalid: 'Invalid phone number',
    recoverTitle: 'Recover Password',
    recoverHeaderQuestion: 'Forgot your\npassword?',
    recoverSelectMethod: 'Choose how to find your account',
    recoverMethodRut: 'RUT',
    recoverMethodEmail: 'Email',
    recoverButtonSending: 'Sending...',
    recoverButton: 'Recover',
    recoverSendingCodeTitle: 'Sending code...',
    recoverSendingCodeBody: 'Please wait while we process your request',
    recoverCodeSentTitle: 'Code sent!',
    recoverErrorTitle: 'Error',
    recoverModalUnderstand: 'Got it',
  recoverFieldRequired: 'Please fill in the required field.',
  recoverConnectionError: 'Connection error. Please check your internet connection.',
    verifyTitle: 'Verify Code',
    verifyHeaderTitle: 'Enter the\ncode',
    verifyCodeSentTo: 'Code sent to:',
    verifyCodePlaceholder: '000000',
    verifyCodeHint: 'Enter the 6 digits of the code',
    verifyButtonVerifying: 'Verifying...',
    verifyButton: 'Verify code',
    verifyResendQuestion: 'Didn’t receive the code?',
    verifyResendLink: 'Send again',
    verifyModalVerifyingTitle: 'Verifying code...',
    verifyModalVerifyingBody: 'Please wait while we validate your code',
    verifyModalSuccessTitle: 'Code verified!',
    verifyModalErrorTitle: 'Error',
    verifyModalRetry: 'Retry',
    resetTitle: 'New Password',
    resetHeaderAlmost: 'Almost there!',
    resetInfoTitle: 'Enter your new password',
    resetInfoBody: 'It must meet the security requirements',
    resetNewPasswordLabel: 'New Password',
    resetConfirmPasswordLabel: 'Confirm Password',
    resetButtonUpdating: 'Updating...',
    resetButton: 'Change Password',
    resetModalUpdatingTitle: 'Updating password...',
    resetModalUpdatingBody: 'Please wait while we update your password',
    resetModalSuccessTitle: 'Password updated!',
    resetModalRedirectHint: 'Redirecting to login...',
    resetModalErrorTitle: 'Error',
    resetModalRetry: 'Retry',
    emailPlaceholder: 'userinfracheck@mail.com',
    emailErrorDefault: 'Enter a valid email (e.g., user@domain.com)',
    rutPlaceholder: '12.345.678-k',
    rutErrorDefault: 'Enter a valid RUT (e.g., 12.345.678-9)',
  },
};

export interface LanguageContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: keyof typeof TRANSLATIONS['es']) => string;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>('es');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        if (saved === 'es' || saved === 'en') {
          setLocaleState(saved);
        }
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const setLocale = (next: Locale) => {
    setLocaleState(next);
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => {});
  };

  const value = useMemo<LanguageContextValue>(() => {
    const dict = TRANSLATIONS[locale];
    return {
      locale,
      setLocale,
      t: (key) => dict[key],
    };
  }, [locale]);

  if (!ready) {
    // Podrías mostrar un loader global aquí si quisieras.
    return null;
  }

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextValue => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
