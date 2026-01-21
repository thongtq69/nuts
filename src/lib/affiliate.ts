import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const SECRET_KEY = process.env.AFFILIATE_SECRET_KEY || 'gonuts-affiliate-secret-key-2024!';

export function encrypt(text: string): string {
    const iv = crypto.randomBytes(IV_LENGTH);
    const salt = crypto.randomBytes(SALT_LENGTH);
    
    const key = crypto.pbkdf2Sync(SECRET_KEY, salt, 100000, KEY_LENGTH, 'sha512');
    
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return Buffer.concat([
        salt,
        iv,
        tag,
        Buffer.from(encrypted, 'hex')
    ]).toString('base64');
}

export function decrypt(encryptedData: string): string | null {
    try {
        const buffer = Buffer.from(encryptedData, 'base64');
        
        const salt = buffer.subarray(0, SALT_LENGTH);
        const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
        const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
        
        const key = crypto.pbkdf2Sync(SECRET_KEY, salt, 100000, KEY_LENGTH, 'sha512');
        
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);
        
        let decrypted = decipher.update(encrypted.toString('hex'), 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        
        return decrypted;
    } catch (error) {
        console.error('Decrypt error:', error);
        return null;
    }
}

export function generateShortCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

export function encodeAffiliateId(userId: string): string {
    return encrypt(userId);
}

export function decodeAffiliateId(encodedId: string): string | null {
    return decrypt(encodedId);
}

export function generateReferralLink(encodedCode: string, baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'): string {
    return `${baseUrl}/ref/${encodedCode}`;
}
