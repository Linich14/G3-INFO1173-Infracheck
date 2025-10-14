/**
 * Tipos para el servicio de almacenamiento seguro
 */

export interface SecureStorageConfig {
  encryptionKeyLength: number;
  maxDataAge: number; // en milisegundos
  hashAlgorithm: string;
}

export interface EncryptedData {
  data: string; // base64 encoded
  hash: string; // integrity hash
  timestamp: number; // creation timestamp
}

export interface SecureStorageOptions {
  enableMigration?: boolean;
  enableIntegrityCheck?: boolean;
  maxRetries?: number;
}