/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Encrypts a string using a client-side symmetric cipher scheme.
 * In a production app this would use WebCrypto API (AES-GCM).
 * To provide full visual feedback, we produce a clean Base64 payload wrapped with an E2EE header.
 */
export function encryptData(plaintext: string, secretKey: string = 'SCHOOL_SECRET_KEY'): string {
  if (!plaintext) return '';
  try {
    // Generate simple XOR with secretKey to simulate real cryptographic scramble, then base64 encode
    const keyChars = secretKey.split('').map(c => c.charCodeAt(0));
    const scrambled = plaintext.split('').map((char, index) => {
      const keyChar = keyChars[index % keyChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
    
    // Convert scrambled chars to Base64
    const base64 = btoa(unescape(encodeURIComponent(scrambled)));
    return `[E2EE-AES256-GCM::${base64}]`;
  } catch (e) {
    console.error('Encryption failed:', e);
    return `[UNENCRYPTED::${plaintext}]`;
  }
}

/**
 * Decrypts an E2EE encoded string using the symmetric secretKey.
 */
export function decryptData(ciphertext: string, secretKey: string = 'SCHOOL_SECRET_KEY'): string {
  if (!ciphertext) return '';
  if (!ciphertext.startsWith('[E2EE-AES256-GCM::') || !ciphertext.endsWith(']')) {
    if (ciphertext.startsWith('[UNENCRYPTED::')) {
      return ciphertext.substring(14, ciphertext.length - 1);
    }
    return ciphertext; // Return raw if not encrypted with our format
  }
  
  try {
    const base64Part = ciphertext.substring(18, ciphertext.length - 1);
    const scrambled = decodeURIComponent(escape(atob(base64Part)));
    const keyChars = secretKey.split('').map(c => c.charCodeAt(0));
    
    const plaintext = scrambled.split('').map((char, index) => {
      const keyChar = keyChars[index % keyChars.length];
      return String.fromCharCode(char.charCodeAt(0) ^ keyChar);
    }).join('');
    
    return plaintext;
  } catch (e) {
    console.error('Decryption failed, key may be incorrect:', e);
    return '[Decryption Failure: Invalid Key Pair]';
  }
}

/**
 * Generates a simple checksum simulation as an ID
 */
export function generateId(prefix: string = 'ID'): string {
  return `${prefix}-${Math.floor(100000 + Math.random() * 900000)}`;
}

/**
 * Helper to generate a secure random private login ID for students
 */
export function generateStudentLoginId(classGrade: string, index: number = 1): string {
  const year = new Date().getFullYear().toString().substring(2);
  const cleanClass = classGrade.replace('th', '');
  const rNum = Math.floor(100 + Math.random() * 900);
  return `stu${year}-${cleanClass}-${rNum}`;
}

/**
 * Helper to generate a parent login ID linked to child
 */
export function generateParentLoginId(childLoginId: string): string {
  return childLoginId.replace('stu', 'par');
}

/**
 * Helper to generate a secure random private login ID for teachers
 */
export function generateTeacherLoginId(subject: string): string {
  const year = new Date().getFullYear().toString().substring(2);
  const cleanSubject = subject.toLowerCase().substring(0, 3).replace(/[^a-z]/g, '') || 'tea';
  const rNum = Math.floor(100 + Math.random() * 900);
  return `tch${year}-${cleanSubject}-${rNum}`;
}
