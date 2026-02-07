/**
 * Text utility functions for cleaning and sanitizing content
 */

/**
 * Clean text content by removing invisible characters and normalizing spaces
 * This prevents word-breaking issues in Vietnamese text
 */
export function cleanTextContent(text: string | undefined | null): string {
    if (!text) return '';

    let cleaned = String(text);

    // Remove zero-width spaces and other invisible characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, ''); // Zero-width spaces
    cleaned = cleaned.replace(/[\u00AD]/g, ''); // Soft hyphens

    // Replace non-breaking spaces with regular spaces
    cleaned = cleaned.replace(/\u00A0/g, ' ');
    cleaned = cleaned.replace(/&nbsp;/g, ' ');

    // Replace multiple spaces with single space (but preserve intentional formatting in HTML)
    // Only do this for plain text, not HTML
    if (!cleaned.includes('<')) {
        cleaned = cleaned.replace(/\s+/g, ' ');
    }

    // Normalize unicode characters
    cleaned = cleaned.normalize('NFC');

    return cleaned;
}

/**
 * Clean HTML content specifically for product descriptions
 */
export function cleanHTMLContent(html: string | undefined | null): string {
    if (!html) return '';

    let cleaned = String(html);

    // Remove zero-width spaces and invisible characters
    cleaned = cleaned.replace(/[\u200B-\u200D\uFEFF]/g, '');
    cleaned = cleaned.replace(/[\u00AD]/g, '');

    // Replace non-breaking spaces with regular spaces
    // This is critical for Vietnamese text wrapping
    cleaned = cleaned.replace(/&nbsp;/g, ' ');
    cleaned = cleaned.replace(/\u00A0/g, ' ');

    // Remove word-joiner characters
    cleaned = cleaned.replace(/\u2060/g, '');

    // Normalize unicode
    cleaned = cleaned.normalize('NFC');

    return cleaned;
}
