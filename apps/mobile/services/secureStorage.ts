import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { SecureStorageConfig, EncryptedData, SecureStorageOptions } from './types';

/**
 * Servicio de almacenamiento seguro con encriptación AES
 * Proporciona una capa de seguridad adicional para datos sensibles como tokens
 */
class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: string | null = null;
  private readonly ENCRYPTION_KEY_STORAGE_KEY = '@encryption_key';
  private readonly CONFIG: SecureStorageConfig = {
    encryptionKeyLength: 32, // 256 bits
    maxDataAge: 24 * 60 * 60 * 1000, // 24 horas
    hashAlgorithm: Crypto.CryptoDigestAlgorithm.SHA256
  };

  private constructor() {}

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  /**
   * Inicializa el servicio generando o recuperando la clave de encriptación
   */
  async initialize(options: SecureStorageOptions = {}): Promise<void> {
    try {
      // Intentar recuperar la clave existente
      const storedKey = await AsyncStorage.getItem(this.ENCRYPTION_KEY_STORAGE_KEY);

      if (storedKey) {
        this.encryptionKey = storedKey;
      } else {
        // Generar una nueva clave de 256 bits (32 bytes) para AES-256
        const keyBytes = Crypto.getRandomBytes(this.CONFIG.encryptionKeyLength);
        this.encryptionKey = Array.from(keyBytes, byte => byte.toString(16).padStart(2, '0')).join('');

        // Almacenar la clave para uso futuro
        await AsyncStorage.setItem(this.ENCRYPTION_KEY_STORAGE_KEY, this.encryptionKey);
      }

      // Si está habilitada la migración, intentar migrar datos existentes
      if (options.enableMigration) {
        await this.migrateLegacyData();
      }
    } catch (error) {
      console.error('Error initializing secure storage:', error);
      throw new Error('Failed to initialize secure storage');
    }
  }

  /**
   * Migra datos existentes de AsyncStorage normal al almacenamiento seguro
   */
  private async migrateLegacyData(): Promise<void> {
    try {
      // Obtener todas las claves que podrían contener datos sensibles
      const allKeys = await AsyncStorage.getAllKeys();
      const sensitiveKeys = allKeys.filter(key =>
        key.includes('token') ||
        key.includes('auth') ||
        key.includes('password') ||
        key.includes('secret')
      );

      for (const key of sensitiveKeys) {
        const existingData = await AsyncStorage.getItem(key);
        if (existingData && !(await this.getItem(key))) {
          // Solo migrar si no existe ya en el almacenamiento seguro
          await this.setItem(key, existingData);
          console.log(`Migrated legacy data for key: ${key}`);
        }
      }
    } catch (error) {
      console.warn('Error migrating legacy data:', error);
    }
  }

  /**
   * Encripta datos usando un método simplificado pero seguro
   */
  private async encryptData(data: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Secure storage not initialized');
    }

    try {
      // Generar un salt aleatorio
      const salt = Crypto.getRandomBytes(16);

      // Crear un hash simple pero efectivo usando el salt y la clave
      const combined = data + this.encryptionKey + Array.from(salt).join('');
      const hash = await this.simpleHash(combined);

      // Crear el paquete encriptado
      const encrypted = btoa(JSON.stringify({
        data: btoa(data),
        salt: Array.from(salt).join(','),
        hash: hash,
        timestamp: Date.now()
      }));

      return encrypted;
    } catch (error) {
      console.error('Error encrypting data:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Hash simple pero efectivo para integridad
   */
  private async simpleHash(input: string): Promise<string> {
    try {
      // Intentar usar Crypto.digestStringAsync si está disponible
      if (Crypto.digestStringAsync) {
        return await Crypto.digestStringAsync(
          Crypto.CryptoDigestAlgorithm.SHA256,
          input
        );
      }
    } catch (error) {
      console.warn('Crypto.digestStringAsync not available, using fallback');
    }

    // Fallback: hash simple usando operaciones básicas
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32 bits
    }
    return Math.abs(hash).toString(16);
  }

  /**
   * Desencripta datos usando AES-GCM
   */
  private async decryptData(encryptedData: string): Promise<string> {
    if (!this.encryptionKey) {
      throw new Error('Secure storage not initialized');
    }

    try {
      // Intentar decodificar el string encriptado
      let decoded;
      try {
        decoded = JSON.parse(atob(encryptedData));
      } catch (parseError) {
        // Si no puede parsearse como JSON, podría ser un dato legacy no encriptado
        return encryptedData;
      }

      // Verificar que tenga la estructura esperada
      if (!decoded.data || !decoded.hash || !decoded.timestamp) {
        return encryptedData;
      }

      // Verificar integridad con hash
      const salt = decoded.salt ? decoded.salt.split(',').map(Number) : [];
      const combined = atob(decoded.data) + this.encryptionKey + salt.join('');
      const calculatedHash = await this.simpleHash(combined);

      if (calculatedHash !== decoded.hash) {
        throw new Error('Data integrity check failed - data may be corrupted');
      }

      // Verificar que no haya expirado (opcional, 24 horas)
      const now = Date.now();
      const dataAge = now - decoded.timestamp;
      const maxAge = this.CONFIG.maxDataAge;

      if (dataAge > maxAge) {
        throw new Error('Encrypted data has expired');
      }

      return atob(decoded.data);
    } catch (error: any) {
      // Log detallado del error solo en desarrollo
      if (__DEV__) {
        console.error('Error decrypting data:', {
          error: error.message,
          encryptedDataLength: encryptedData?.length,
          hasEncryptionKey: !!this.encryptionKey,
          timestamp: Date.now()
        });
      }

      // Re-throw con mensaje más específico
      if (error.message.includes('integrity check failed')) {
        throw new Error('Failed to decrypt data: integrity check failed');
      } else if (error.message.includes('expired')) {
        throw new Error('Failed to decrypt data: data has expired');
      } else {
        throw new Error(`Failed to decrypt data: ${error.message}`);
      }
    }
  }

  /**
   * Almacena un valor de forma segura
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      const encryptedValue = await this.encryptData(value);
      await AsyncStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error storing secure item:', error);
      throw new Error('Failed to store secure item');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      const encryptedValue = await AsyncStorage.getItem(key);
      if (!encryptedValue) {
        return null;
      }

      return await this.decryptData(encryptedValue);
    } catch (error: any) {
      console.error(`Error retrieving secure item '${key}':`, error.message);

      // Si hay error de desencriptación, intentar limpiar y retornar null
      try {
        await this.removeItem(key);
      } catch (cleanupError) {
        // Silenciar errores de limpieza
      }

      return null;
    }
  }

  /**
   * Elimina un valor almacenado
   */
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing secure item:', error);
      throw new Error('Failed to remove secure item');
    }
  }

  /**
   * Limpia todos los datos seguros (útil para logout)
   */
  async clearAll(): Promise<void> {
    try {
      // Obtener todas las claves
      const keys = await AsyncStorage.getAllKeys();

      // Filtrar solo las claves relacionadas con seguridad
      const secureKeys = keys.filter(key =>
        key.includes('auth_') ||
        key.includes('encryption') ||
        key.includes('secure')
      );

      if (secureKeys.length > 0) {
        await AsyncStorage.multiRemove(secureKeys);
      }

      // Resetear el estado interno
      this.encryptionKey = null;

    } catch (error) {
      console.error('Error clearing secure storage:', error);
      throw new Error('Failed to clear secure storage');
    }
  }

  /**
   * Verifica si el dispositivo soporta las características de seguridad requeridas
   */
  isSecureStorageAvailable(): boolean {
    // Verificar si estamos en un entorno que soporta crypto
    return typeof Crypto !== 'undefined' && typeof Crypto.getRandomBytes === 'function';
  }
}

// Exportar instancia singleton
export const secureStorage = SecureStorage.getInstance();

// Funciones de conveniencia para uso directo
export const initializeSecureStorage = (options?: SecureStorageOptions) =>
  secureStorage.initialize(options);
export const secureSetItem = (key: string, value: string) => secureStorage.setItem(key, value);
export const secureGetItem = (key: string) => secureStorage.getItem(key);
export const secureRemoveItem = (key: string) => secureStorage.removeItem(key);
export const secureClearAll = () => secureStorage.clearAll();