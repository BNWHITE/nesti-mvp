/**
 * Input Validator
 * Validates and sanitizes all user inputs to prevent security vulnerabilities
 */

/**
 * Validates email format
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export const isValidEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  
  const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
  return emailRegex.test(email.trim());
};

/**
 * Detects potential SQL injection patterns
 * Note: This is defense in depth - always use parameterized queries as primary defense
 * @param {string} input - User input to check
 * @returns {boolean} True if SQL injection detected
 */
export const containsSQLInjection = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  // Check for SQL injection with multiple dangerous patterns
  // Reduced false positives by requiring suspicious context
  const dangerousPatterns = [
    // SQL comments with dangerous keywords
    /(--|\/\*).*\b(DROP|DELETE|UPDATE|INSERT|ALTER)\b/gi,
    // UNION-based injection
    /\bUNION\b.*\bSELECT\b/gi,
    // Boolean-based injection with operators
    /(\bOR\b|\bAND\b)\s*['"]?\s*\d+\s*=\s*\d+/gi,
    // Stacked queries
    /;\s*(DROP|DELETE|UPDATE|INSERT|ALTER|CREATE)\b/gi,
    // Hex encoding attempt
    /0x[0-9a-f]{8,}/gi,
  ];
  
  return dangerousPatterns.some(pattern => pattern.test(input));
};

/**
 * Detects potential XSS (Cross-Site Scripting) patterns
 * @param {string} input - User input to check
 * @returns {boolean} True if XSS detected
 */
export const containsXSS = (input) => {
  if (!input || typeof input !== 'string') return false;
  
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
    /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    /javascript:/gi,
    /onerror\s*=/gi,
    /onload\s*=/gi,
    /onclick\s*=/gi,
    /onmouseover\s*=/gi,
  ];
  
  return xssPatterns.some(pattern => pattern.test(input));
};

/**
 * Sanitizes string input by removing potentially dangerous characters
 * @param {string} input - User input to sanitize
 * @param {number} maxLength - Maximum allowed length (default 1000)
 * @returns {string} Sanitized input
 * @throws {Error} If injection patterns detected
 */
export const sanitizeString = (input, maxLength = 1000) => {
  if (input === null || input === undefined) return '';
  
  const strInput = String(input);
  
  // Check for injection patterns
  if (containsSQLInjection(strInput)) {
    throw new Error('Invalid input: potential SQL injection detected');
  }
  
  if (containsXSS(strInput)) {
    throw new Error('Invalid input: potential XSS detected');
  }
  
  // Trim and limit length
  let sanitized = strInput.trim().substring(0, maxLength);
  
  // Remove null bytes
  sanitized = sanitized.replace(/\0/g, '');
  
  return sanitized;
};

/**
 * Validates UUID format
 * @param {string} uuid - UUID to validate
 * @returns {boolean} True if valid UUID
 */
export const isValidUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

/**
 * Validates integer input
 * @param {any} value - Value to validate
 * @param {number} min - Minimum allowed value
 * @param {number} max - Maximum allowed value
 * @returns {boolean} True if valid integer in range
 */
export const isValidInteger = (value, min = -Infinity, max = Infinity) => {
  const num = parseInt(value, 10);
  return !isNaN(num) && num >= min && num <= max && num === parseFloat(value);
};

/**
 * Validates URL format
 * @param {string} url - URL to validate
 * @param {boolean} requireHttps - Whether to require HTTPS
 * @returns {boolean} True if valid URL
 */
export const isValidURL = (url, requireHttps = false) => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    
    if (requireHttps && urlObj.protocol !== 'https:') {
      return false;
    }
    
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

/**
 * Validates file upload
 * @param {File} file - File to validate
 * @param {Array<string>} allowedTypes - Allowed MIME types
 * @param {number} maxSizeMB - Maximum file size in MB
 * @returns {Object} Validation result with success flag and message
 */
export const validateFileUpload = (file, allowedTypes = [], maxSizeMB = 10) => {
  if (!file) {
    return { success: false, message: 'No file provided' };
  }
  
  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      success: false, 
      message: `File size exceeds ${maxSizeMB}MB limit` 
    };
  }
  
  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return { 
      success: false, 
      message: `File type ${file.type} not allowed. Allowed types: ${allowedTypes.join(', ')}` 
    };
  }
  
  // Check filename for path traversal
  if (file.name.includes('..') || file.name.includes('/') || file.name.includes('\\')) {
    return { 
      success: false, 
      message: 'Invalid filename' 
    };
  }
  
  return { success: true, message: 'File is valid' };
};

/**
 * Escapes HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeHTML = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const htmlEscapes = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return text.replace(/[&<>"'/]/g, (char) => htmlEscapes[char]);
};

/**
 * Validates date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid date
 */
export const isValidDate = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validates phone number (basic international format)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export const isValidPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;
  
  // Allow digits, spaces, dashes, parentheses, and + for international
  const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;
  const cleaned = phone.trim();
  
  return phoneRegex.test(cleaned) && cleaned.length >= 10 && cleaned.length <= 20;
};

/**
 * Checks if input contains only alphanumeric characters
 * @param {string} input - Input to check
 * @param {boolean} allowSpaces - Whether to allow spaces
 * @returns {boolean} True if alphanumeric
 */
export const isAlphanumeric = (input, allowSpaces = false) => {
  if (!input || typeof input !== 'string') return false;
  
  const regex = allowSpaces ? /^[a-zA-Z0-9\s]+$/ : /^[a-zA-Z0-9]+$/;
  return regex.test(input);
};

/**
 * Validates password strength
 * @param {string} password - Password to validate
 * @returns {Object} Validation result with strength score and messages
 */
export const validatePasswordStrength = (password) => {
  if (!password || typeof password !== 'string') {
    return {
      success: false,
      score: 0,
      messages: ['Password is required'],
    };
  }
  
  const messages = [];
  let score = 0;
  
  // Length check
  if (password.length < 8) {
    messages.push('Password must be at least 8 characters long');
  } else {
    score += 1;
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    messages.push('Password must contain at least one uppercase letter');
  } else {
    score += 1;
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    messages.push('Password must contain at least one lowercase letter');
  } else {
    score += 1;
  }
  
  // Number check
  if (!/[0-9]/.test(password)) {
    messages.push('Password must contain at least one number');
  } else {
    score += 1;
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    messages.push('Password must contain at least one special character');
  } else {
    score += 1;
  }
  
  return {
    success: score >= 4,
    score,
    messages,
    strength: score < 2 ? 'weak' : score < 4 ? 'medium' : 'strong',
  };
};

/**
 * Rate limiter for client-side actions
 */
export class ClientRateLimiter {
  constructor() {
    this.attempts = new Map();
  }
  
  /**
   * Checks if action is allowed based on rate limit
   * @param {string} key - Unique key for the action
   * @param {number} maxAttempts - Maximum attempts allowed
   * @param {number} windowMs - Time window in milliseconds
   * @returns {boolean} True if action is allowed
   */
  isAllowed(key, maxAttempts = 5, windowMs = 60000) {
    const now = Date.now();
    const attemptData = this.attempts.get(key) || { count: 0, resetTime: now + windowMs };
    
    // Reset if window has passed
    if (now > attemptData.resetTime) {
      attemptData.count = 0;
      attemptData.resetTime = now + windowMs;
    }
    
    // Check if limit exceeded
    if (attemptData.count >= maxAttempts) {
      return false;
    }
    
    // Increment counter
    attemptData.count++;
    this.attempts.set(key, attemptData);
    
    return true;
  }
  
  /**
   * Resets rate limit for a key
   * @param {string} key - Key to reset
   */
  reset(key) {
    this.attempts.delete(key);
  }
  
  /**
   * Gets remaining attempts
   * @param {string} key - Key to check
   * @param {number} maxAttempts - Maximum attempts allowed
   * @returns {number} Remaining attempts
   */
  getRemainingAttempts(key, maxAttempts = 5) {
    const attemptData = this.attempts.get(key);
    if (!attemptData) return maxAttempts;
    
    const now = Date.now();
    if (now > attemptData.resetTime) {
      return maxAttempts;
    }
    
    return Math.max(0, maxAttempts - attemptData.count);
  }
}

// Export singleton instance
export const rateLimiter = new ClientRateLimiter();
