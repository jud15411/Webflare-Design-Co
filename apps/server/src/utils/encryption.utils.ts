// src/utils/encryption.utils.ts

import crypto from 'crypto';

// Use AES-256-CBC algorithm
const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16; // Initialization Vector length for AES

// WARNING: This key MUST be 32 characters long.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  // Log this error to prevent saving unencrypted data in production
  console.error('🔴 ENCRYPTION_KEY must be set as a 32-character string in your environment variables!');
  // You might want to throw an error here to prevent server startup
}

// Convert the key to a buffer once (safe to use '!' because we check above)
const keyBuffer = Buffer.from(ENCRYPTION_KEY!, 'utf8');

/**
 * Encrypts a plaintext string.
 * @param text The string to encrypt.
 * @returns The encrypted string in 'iv:encryptedData' format.
 */
export function encrypt(text: string | undefined): string | undefined {
  if (!text) return text;
  
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    // 'text' is guaranteed to be a string here
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    // Combine IV and encrypted data, separated by a colon
    return iv.toString('hex') + ':' + encrypted;
  } catch (error) {
    console.error('Encryption failed:', error);
    return text; 
  }
}

/**
 * Decrypts a string in 'iv:encryptedData' format.
 * @param text The string to decrypt.
 * @returns The decrypted string. Returns original text if decryption fails or format is invalid.
 */
export function decrypt(text: string | undefined): string | undefined {
  if (!text) return text;

  try {
    const parts = text.split(':');
    // Check for valid format and correct IV length in the hex string (16 bytes * 2 chars/byte = 32 chars)
    if (parts.length !== 2 || parts[0]!.length !== IV_LENGTH * 2) { 
      return text; 
    }
    
    // Non-null assertion is safe because we checked parts.length
    const iv = Buffer.from(parts[0]!, 'hex'); 
    const encryptedText = parts[1]!; 
    
    if (iv.length !== IV_LENGTH) {
        return text;
    }

    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    // TypeScript correctly infers 'decrypted' as string here
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8'); 
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    console.warn('Decryption failed, returning encrypted string:', error);
    return text; 
  }
}