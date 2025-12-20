/**
 * Security Utilities
 * Provides security-related helper functions for the Nesti application
 */

/**
 * Generates a Content Security Policy (CSP) meta tag
 * @returns {string} CSP meta tag
 */
export const getCSPMetaTag = () => {
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "media-src 'self' https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.vercel.com",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];
  
  return cspDirectives.join('; ');
};

/**
 * Removes all console statements in production
 */
export const disableConsoleInProduction = () => {
  if (process.env.NODE_ENV === 'production') {
    console.log = () => {};
    console.debug = () => {};
    console.info = () => {};
    console.warn = () => {};
    // Keep console.error for critical errors
  }
};

/**
 * Checks if current environment is secure (HTTPS)
 * @returns {boolean} True if running on HTTPS or localhost
 */
export const isSecureContext = () => {
  if (typeof window === 'undefined') return false;
  
  return (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );
};

/**
 * Generates a random string for CSRF tokens or nonces
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
export const generateRandomString = (length = 32) => {
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

/**
 * Hashes a string using SHA-256
 * @param {string} message - String to hash
 * @returns {Promise<string>} Hex string of hash
 */
export const hashString = async (message) => {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Securely stores data in localStorage (with warning)
 * Note: Never store sensitive tokens in localStorage!
 * @param {string} key - Storage key
 * @param {any} value - Value to store
 */
export const secureLocalStorage = {
  set: (key, value) => {
    if (typeof window === 'undefined') return;
    
    // Warn if trying to store sensitive data
    if (key.toLowerCase().includes('token') || key.toLowerCase().includes('password')) {
      console.error('WARNING: Never store tokens or passwords in localStorage!');
      return;
    }
    
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
    }
  },
  
  get: (key) => {
    if (typeof window === 'undefined') return null;
    
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Failed to read from localStorage:', error);
      return null;
    }
  },
  
  remove: (key) => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Failed to remove from localStorage:', error);
    }
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Failed to clear localStorage:', error);
    }
  },
};

/**
 * Checks if browser has security features enabled
 * @returns {Object} Security features status
 */
export const checkBrowserSecurity = () => {
  if (typeof window === 'undefined') {
    return {
      https: false,
      secureContext: false,
      cookiesEnabled: false,
      localStorage: false,
    };
  }
  
  return {
    https: window.location.protocol === 'https:',
    secureContext: window.isSecureContext || false,
    cookiesEnabled: navigator.cookieEnabled || false,
    localStorage: (() => {
      try {
        const test = '__test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
        return true;
      } catch {
        return false;
      }
    })(),
  };
};

/**
 * Sanitizes user input for display (prevents XSS)
 * @param {string} input - User input to sanitize
 * @returns {string} Sanitized input safe for display
 */
export const sanitizeForDisplay = (input) => {
  if (!input || typeof input !== 'string') return '';
  
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

/**
 * Detects if user is behind a VPN or proxy (basic check)
 * @returns {Promise<Object>} Detection result
 */
export const detectProxy = async () => {
  try {
    // Check WebRTC leak
    const pc = new RTCPeerConnection({ iceServers: [] });
    const ips = new Set();
    
    pc.createDataChannel('');
    pc.createOffer().then(offer => pc.setLocalDescription(offer));
    
    return new Promise((resolve) => {
      pc.onicecandidate = (ice) => {
        if (!ice || !ice.candidate || !ice.candidate.candidate) {
          resolve({
            detected: ips.size > 1,
            ips: Array.from(ips),
          });
          pc.close();
          return;
        }
        
        const ipMatch = ice.candidate.candidate.match(/([0-9]{1,3}\.){3}[0-9]{1,3}/);
        if (ipMatch) {
          ips.add(ipMatch[0]);
        }
      };
      
      // Timeout after 1 second
      setTimeout(() => {
        resolve({
          detected: false,
          ips: Array.from(ips),
        });
        pc.close();
      }, 1000);
    });
  } catch (error) {
    return {
      detected: false,
      error: error.message,
    };
  }
};

/**
 * Gets browser fingerprint for fraud detection
 * @returns {Promise<string>} Browser fingerprint hash
 */
export const getBrowserFingerprint = async () => {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.colorDepth,
    screen.width,
    screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency,
    navigator.deviceMemory,
    navigator.platform,
  ];
  
  const fingerprint = components.join('|');
  return await hashString(fingerprint);
};

/**
 * Validates Supabase JWT token structure (client-side check only)
 * Note: Always validate tokens server-side!
 * @param {string} token - JWT token to validate
 * @returns {Object} Validation result
 */
export const validateJWTStructure = (token) => {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'Invalid token' };
  }
  
  const parts = token.split('.');
  if (parts.length !== 3) {
    return { valid: false, error: 'Invalid JWT structure' };
  }
  
  try {
    const payload = JSON.parse(atob(parts[1]));
    
    // Check expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return { valid: false, error: 'Token expired' };
    }
    
    return {
      valid: true,
      payload,
      expiresAt: payload.exp ? new Date(payload.exp * 1000) : null,
    };
  } catch (error) {
    return { valid: false, error: 'Failed to parse token' };
  }
};

/**
 * Monitors for suspicious activity patterns
 */
export class SecurityMonitor {
  constructor() {
    this.events = [];
    this.maxEvents = 1000;
  }
  
  /**
   * Logs a security event
   * @param {string} type - Event type
   * @param {Object} details - Event details
   */
  logEvent(type, details = {}) {
    const event = {
      type,
      details,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
    
    this.events.push(event);
    
    // Keep only last N events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    // Check for suspicious patterns
    this.detectSuspiciousActivity();
  }
  
  /**
   * Detects suspicious activity patterns
   */
  detectSuspiciousActivity() {
    const recentEvents = this.events.filter(
      e => e.timestamp > Date.now() - 60000 // Last minute
    );
    
    // Too many failed login attempts
    const failedLogins = recentEvents.filter(e => e.type === 'failed_login');
    if (failedLogins.length > 5) {
      console.warn('Suspicious: Multiple failed login attempts detected');
      this.triggerAlert('multiple_failed_logins', { count: failedLogins.length });
    }
    
    // Too many rapid requests
    if (recentEvents.length > 100) {
      console.warn('Suspicious: High request rate detected');
      this.triggerAlert('high_request_rate', { count: recentEvents.length });
    }
  }
  
  /**
   * Triggers a security alert
   * @param {string} alertType - Type of alert
   * @param {Object} data - Alert data
   */
  triggerAlert(alertType, data) {
    // In production, this would send to a security monitoring service
    console.error('Security Alert:', alertType, data);
    
    // You can integrate with services like:
    // - Sentry
    // - LogRocket
    // - Custom backend endpoint
  }
  
  /**
   * Gets recent events
   * @param {number} limit - Number of events to return
   * @returns {Array} Recent events
   */
  getRecentEvents(limit = 10) {
    return this.events.slice(-limit);
  }
  
  /**
   * Clears all events
   */
  clear() {
    this.events = [];
  }
}

// Export singleton instance
export const securityMonitor = new SecurityMonitor();

/**
 * Initialize security features
 */
export const initializeSecurity = () => {
  // Disable console in production
  disableConsoleInProduction();
  
  // Check if running in secure context
  if (!isSecureContext() && process.env.NODE_ENV === 'production') {
    console.error('WARNING: Application must run over HTTPS in production');
  }
  
  // Monitor security events
  window.addEventListener('error', (event) => {
    securityMonitor.logEvent('javascript_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
    });
  });
  
  // Note: Developer tools detection is intentionally basic
  // This is for monitoring only, not as a security measure
  // Real security comes from server-side validation and RLS
  const detectDevTools = () => {
    const threshold = 160; // Typical devtools causes this difference
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      securityMonitor.logEvent('devtools_possibly_open', {
        note: 'Detection unreliable - for monitoring only'
      });
    }
  };
  
  // Run once on init (don't rely on this for security)
  if (process.env.NODE_ENV === 'production') {
    detectDevTools();
  }
  
  return {
    csp: getCSPMetaTag(),
    browserSecurity: checkBrowserSecurity(),
    fingerprint: getBrowserFingerprint(),
  };
};
