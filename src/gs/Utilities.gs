/**
 * EduTech Framework - Utilities Module
 * @fileoverview Utility functions for common operations
 * @version 1.0.0
 */

/**
 * Utilities singleton
 * @type {Object}
 */
const Utilities_ = {
  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId: function() {
    return Utilities.getUuid();
  },

  /**
   * Generate random string
   * @param {number} length - Length of string
   * @returns {string} Random string
   */
  generateRandomString: function(length = 8) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Hash password using Utilities.computeDigest
   * @param {string} password - Password to hash
   * @returns {string} Hashed password
   */
  hashPassword: function(password) {
    const salt = this.generateRandomString(16);
    const hash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      password + salt
    );
    const hashStr = Utilities.base64Encode(hash);
    return `${salt}:${hashStr}`;
  },

  /**
   * Verify password
   * @param {string} password - Password to verify
   * @param {string} hash - Hash to compare against
   * @returns {boolean} True if password matches
   */
  verifyPassword: function(password, hash) {
    const parts = hash.split(':');
    if (parts.length !== 2) return false;

    const salt = parts[0];
    const storedHash = parts[1];
    const computedHash = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      password + salt
    );
    const computedHashStr = Utilities.base64Encode(computedHash);

    return storedHash === computedHashStr;
  },

  /**
   * Format date
   * @param {Date} date - Date to format
   * @param {string} format - Format string
   * @returns {string} Formatted date
   */
  formatDate: function(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!(date instanceof Date)) {
      date = new Date(date);
    }

    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    const ss = String(date.getSeconds()).padStart(2, '0');

    format = format.replace('YYYY', yyyy);
    format = format.replace('MM', mm);
    format = format.replace('DD', dd);
    format = format.replace('HH', hh);
    format = format.replace('mm', min);
    format = format.replace('ss', ss);

    return format;
  },

  /**
   * Validate email address
   * @param {string} email - Email to validate
   * @returns {boolean} True if valid email
   */
  isValidEmail: function(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number
   * @param {string} phone - Phone to validate
   * @returns {boolean} True if valid phone
   */
  isValidPhone: function(phone) {
    const phoneRegex = /^[+]?[0-9\s\-()]{10,}$/;
    return phoneRegex.test(phone);
  },

  /**
   * Deep clone object
   * @param {Object} obj - Object to clone
   * @returns {Object} Cloned object
   */
  deepClone: function(obj) {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Merge objects
   * @param {Object} target - Target object
   * @param {Object} source - Source object
   * @returns {Object} Merged object
   */
  merge: function(target, source) {
    for (const key in source) {
      if (source.hasOwnProperty(key)) {
        if (typeof source[key] === 'object' && source[key] !== null) {
          target[key] = this.merge(target[key] || {}, source[key]);
        } else {
          target[key] = source[key];
        }
      }
    }
    return target;
  },

  /**
   * Convert array to object with key
   * @param {Array} array - Array to convert
   * @param {string} key - Key property
   * @returns {Object} Object with key as property
   */
  arrayToObject: function(array, key) {
    const obj = {};
    array.forEach(item => {
      obj[item[key]] = item;
    });
    return obj;
  },

  /**
   * Filter array by object properties
   * @param {Array} array - Array to filter
   * @param {Object} filter - Filter object
   * @returns {Array} Filtered array
   */
  filterArray: function(array, filter) {
    return array.filter(item => {
      for (const key in filter) {
        if (item[key] !== filter[key]) return false;
      }
      return true;
    });
  },

  /**
   * Sort array by property
   * @param {Array} array - Array to sort
   * @param {string} property - Property to sort by
   * @param {boolean} ascending - Sort direction
   * @returns {Array} Sorted array
   */
  sortArray: function(array, property, ascending = true) {
    return array.sort((a, b) => {
      if (a[property] < b[property]) return ascending ? -1 : 1;
      if (a[property] > b[property]) return ascending ? 1 : -1;
      return 0;
    });
  },

  /**
   * Pagination helper
   * @param {Array} array - Array to paginate
   * @param {number} page - Page number (1-based)
   * @param {number} pageSize - Page size
   * @returns {Object} Paginated result
   */
  paginate: function(array, page = 1, pageSize = 20) {
    const total = array.length;
    const totalPages = Math.ceil(total / pageSize);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const data = array.slice(start, end);

    return {
      data: data,
      page: page,
      pageSize: pageSize,
      total: total,
      totalPages: totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }
};
