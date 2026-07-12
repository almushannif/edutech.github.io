/**
 * EduTech Framework - Configuration Module
 * @fileoverview Application configuration and constants
 * @version 1.0.0
 */

/**
 * Configuration object
 * @type {Object}
 */
const CONFIG = {
  // Application Settings
  app: {
    name: 'EduTech Framework',
    version: '1.0.0',
    environment: 'production',
    debug: false,
    timezone: 'UTC'
  },

  // Database Configuration
  database: {
    spreadsheetId: SpreadsheetApp.getActive().getId(),
    sheets: {
      users: 'Users',
      roles: 'Roles',
      permissions: 'Permissions',
      audit: 'Audit',
      settings: 'Settings',
      data: 'Data'
    }
  },

  // Authentication
  auth: {
    sessionTimeout: 3600, // 1 hour in seconds
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    enableGoogleAuth: true,
    enableRememberMe: true
  },

  // Authorization Roles
  roles: {
    ADMIN: 'Admin',
    OPERATOR: 'Operator',
    USER: 'User'
  },

  // Email Configuration
  email: {
    from: Session.getActiveUser().getEmail(),
    replyTo: 'support@edutech.com',
    enableNotifications: true
  },

  // File Upload Configuration
  upload: {
    maxFileSize: 26214400, // 25MB in bytes
    allowedTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'csv', 'jpg', 'jpeg', 'png', 'gif'],
    uploadFolder: 'EduTech-Uploads'
  },

  // Cache Configuration
  cache: {
    duration: 21600, // 6 hours in seconds
    userCachePrefix: 'USER_',
    scriptCachePrefix: 'SCRIPT_'
  },

  // Pagination
  pagination: {
    defaultPageSize: 20,
    maxPageSize: 100
  },

  // API Response
  response: {
    success: true,
    statusCode: 200,
    message: 'Success'
  },

  // Error Messages
  errors: {
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    NOT_FOUND: 'Resource not found',
    VALIDATION_ERROR: 'Validation error',
    SERVER_ERROR: 'Internal server error',
    INVALID_CREDENTIALS: 'Invalid credentials',
    SESSION_EXPIRED: 'Session expired',
    INSUFFICIENT_PERMISSIONS: 'Insufficient permissions'
  },

  // Success Messages
  messages: {
    LOGIN_SUCCESS: 'Login successful',
    LOGOUT_SUCCESS: 'Logout successful',
    CREATE_SUCCESS: 'Record created successfully',
    UPDATE_SUCCESS: 'Record updated successfully',
    DELETE_SUCCESS: 'Record deleted successfully',
    SAVE_SUCCESS: 'Changes saved successfully'
  }
};

/**
 * Get configuration value by dot notation path
 * @param {string} path - Configuration path (e.g., 'database.sheets.users')
 * @param {*} defaultValue - Default value if path not found
 * @returns {*} Configuration value
 */
function getConfig(path, defaultValue = null) {
  const keys = path.split('.');
  let value = CONFIG;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }

  return value;
}

/**
 * Set configuration value by dot notation path
 * @param {string} path - Configuration path
 * @param {*} value - Value to set
 * @returns {void}
 */
function setConfig(path, value) {
  const keys = path.split('.');
  const lastKey = keys.pop();
  let obj = CONFIG;

  for (const key of keys) {
    if (!(key in obj)) {
      obj[key] = {};
    }
    obj = obj[key];
  }

  obj[lastKey] = value;
}
