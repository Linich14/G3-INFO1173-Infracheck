// utils/validation.ts
import { RegisterData } from '../features/auth/types/RegisterData';

export function isValidEmail(email: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);
}

export function isValidRut(rut: string): boolean {
  // Valida formato 99.999.999-k o similar (sin validar dígito verificador real)
  return /^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(rut);
}


// Contraseña: 8-16 caracteres, al menos una mayúscula, al menos un número, sin caracteres especiales
export function isValidPassword(password: string): boolean {
  return (
    password.length >= 8 &&
    password.length <= 16 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /^[A-Za-z0-9]+$/.test(password)
  );
}

// Devuelve el estado de cada condición para feedback en tiempo real
export function getPasswordValidationState(password: string) {
  return {
    length: password.length >= 8 && password.length <= 16,
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    noSpecial: /^[A-Za-z0-9]+$/.test(password),
  };
}

export function validateRegisterData(
  data: RegisterData,
  translate: (key: 'rutErrorDefault' | 'emailErrorDefault' | 'passwordReqLength' | 'passwordReqUppercase' | 'passwordReqNumber' | 'passwordReqNoSpecial' | 'passwordsDoNotMatch' | 'registerUsernameRequired' | 'registerPhoneInvalid') => string,
) {
  const errors: { field: string; message: string }[] = [];

  if (!isValidRut(data.rut)) {
    errors.push({ field: 'rut', message: translate('rutErrorDefault') });
  }

  if (!isValidEmail(data.email)) {
    errors.push({ field: 'email', message: translate('emailErrorDefault') });
  }

  if (!data.username) {
    errors.push({ field: 'username', message: translate('registerUsernameRequired') });
  }

  if (!isValidPassword(data.password)) {
    errors.push({
      field: 'password',
      message:
        translate('passwordReqLength') +
        ' • ' +
        translate('passwordReqUppercase') +
        ' • ' +
        translate('passwordReqNumber') +
        ' • ' +
        translate('passwordReqNoSpecial'),
    });
  }

  if (data.password !== data.confirmPassword) {
    errors.push({ field: 'confirmPassword', message: translate('passwordsDoNotMatch') });
  }

  if (!/^\d{8}$/.test(data.phone.replace('+569', ''))) {
    errors.push({ field: 'phone', message: translate('registerPhoneInvalid') });
  }

  return { isValid: errors.length === 0, errors };
}

// Validar identifier para password reset (RUT o email)
export function isValidIdentifier(identifier: string): { isValid: boolean; type: 'rut' | 'email' | null } {
  if (isValidRut(identifier)) {
    return { isValid: true, type: 'rut' };
  }
  if (isValidEmail(identifier)) {
    return { isValid: true, type: 'email' };
  }
  return { isValid: false, type: null };
}
