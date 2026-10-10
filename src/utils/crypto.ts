/**
 * Real Web Crypto API (SubtleCrypto) implementation for client-side zero-knowledge encryption
 * Uses AES-GCM (256-bit) and PBKDF2 for password derivation.
 */

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Convert string to UTF-8 Uint8Array with ArrayBuffer backing
function strToBuf(str: string): Uint8Array<ArrayBuffer> {
  const enc = new TextEncoder().encode(str);
  const ab = new ArrayBuffer(enc.byteLength);
  const view = new Uint8Array(ab);
  view.set(enc);
  return view;
}

// Convert ArrayBuffer to UTF-8 string
function bufToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

/**
 * Generates a random raw 256-bit AES-GCM key and returns base64 url-safe string
 */
export async function generateSecretLinkKey(): Promise<string> {
  const key = await window.crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  const exported = await window.crypto.subtle.exportKey('raw', key);
  return arrayBufferToBase64(exported).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Encrypts plain text using an AES key string
 */
export async function encryptWithRawKey(plainText: string, rawKeyBase64Url: string): Promise<{ ciphertext: string; iv: string }> {
  // Convert URL safe back to base64
  let base64 = rawKeyBase64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const rawKeyBuf = base64ToArrayBuffer(base64);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKeyBuf,
    { name: 'AES-GCM' },
    false,
    ['encrypt']
  );

  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    strToBuf(plainText)
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuf),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

/**
 * Decrypts ciphertext using an AES raw key string
 */
export async function decryptWithRawKey(ciphertextBase64: string, ivBase64: string, rawKeyBase64Url: string): Promise<string> {
  let base64 = rawKeyBase64Url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const rawKeyBuf = base64ToArrayBuffer(base64);
  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    rawKeyBuf,
    { name: 'AES-GCM' },
    false,
    ['decrypt']
  );

  const ivBuf = base64ToArrayBuffer(ivBase64);
  const cipherBuf = base64ToArrayBuffer(ciphertextBase64);

  const decryptedBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuf) },
    cryptoKey,
    cipherBuf
  );

  return bufToStr(decryptedBuf);
}

/**
 * Encrypts plain text using a user passphrase with PBKDF2 + AES-GCM
 */
export async function encryptWithPassphrase(plainText: string, passphrase: string): Promise<{ ciphertext: string; salt: string; iv: string }> {
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iv = window.crypto.getRandomValues(new Uint8Array(12));

  const pwKey = await window.crypto.subtle.importKey(
    'raw',
    strToBuf(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );

  const encryptedBuf = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    derivedKey,
    strToBuf(plainText)
  );

  return {
    ciphertext: arrayBufferToBase64(encryptedBuf),
    salt: arrayBufferToBase64(salt.buffer),
    iv: arrayBufferToBase64(iv.buffer)
  };
}

/**
 * Decrypts ciphertext using a user passphrase with PBKDF2 + AES-GCM
 */
export async function decryptWithPassphrase(ciphertextBase64: string, passphrase: string, saltBase64: string, ivBase64: string): Promise<string> {
  const saltBuf = base64ToArrayBuffer(saltBase64);
  const ivBuf = base64ToArrayBuffer(ivBase64);
  const cipherBuf = base64ToArrayBuffer(ciphertextBase64);

  const pwKey = await window.crypto.subtle.importKey(
    'raw',
    strToBuf(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  const derivedKey = await window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: new Uint8Array(saltBuf),
      iterations: 100000,
      hash: 'SHA-256'
    },
    pwKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );

  const decryptedBuf = await window.crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: new Uint8Array(ivBuf) },
    derivedKey,
    cipherBuf
  );

  return bufToStr(decryptedBuf);
}
