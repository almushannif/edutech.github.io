/**
 * EduTech Framework - Logger Module
 * @fileoverview Comprehensive logging system with multiple output levels
 * @version 1.0.0
 */

/**
 * Logger singleton
 * @type {Object}
 */
const Logger_ = {
  /**
   * Log level constants
   */
  LEVEL: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR'
  },

  /**
   * Current log level
   */
  currentLevel: 'INFO',

  /**
   * Log messages array
   */
  messages: [],

  /**
   * Debug message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   * @returns {void}
   */
  debug: function(message, data = null) {
    this._log('DEBUG', message, data);
  },

  /**
   * Info message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   * @returns {void}
   */
  info: function(message, data = null) {
    this._log('INFO', message, data);
  },

  /**
   * Warning message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   * @returns {void}
   */
  warn: function(message, data = null) {
    this._log('WARN', message, data);
  },

  /**
   * Error message
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   * @returns {void}
   */
  error: function(message, data = null) {
    this._log('ERROR', message, data);
  },

  /**
   * Internal logging function
   * @private
   * @param {string} level - Log level
   * @param {string} message - Message to log
   * @param {*} data - Additional data
   * @returns {void}
   */
  _log: function(level, message, data = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp: timestamp,
      level: level,
      message: message,
      data: data
    };

    // Store in messages array
    this.messages.push(logEntry);

    // Console output
    const logMessage = `[${timestamp}] ${level}: ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }

    // Store in cache if enabled
    if (APP.debug || level === 'ERROR') {
      try {
        const cache = APP.cache;
        const cacheKey = `LOG_${level}_${Date.now()}`;
        cache.put(cacheKey, JSON.stringify(logEntry), 21600);
      } catch (e) {
        // Cache storage failed, continue
      }
    }
  },

  /**
   * Get all logs
   * @returns {Array} Array of log entries
   */
  getLogs: function() {
    return this.messages;
  },

  /**
   * Clear logs
   * @returns {void}
   */
  clearLogs: function() {
    this.messages = [];
  },

  /**
   * Archive logs to spreadsheet
   * @returns {void}
   */
  archiveLogs: function() {
    if (this.messages.length === 0) return;

    try {
      const sheet = SpreadsheetApp.getActive().getSheetByName('Logs');
      if (!sheet) {
        Logger_.warn('Logs sheet not found');
        return;
      }

      const rows = this.messages.map(log => [
        log.timestamp,
        log.level,
        log.message,
        JSON.stringify(log.data)
      ]);

      sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 4).setValues(rows);
      this.clearLogs();

      Logger_.info('Logs archived successfully');
    } catch (error) {
      Logger_.error('Error archiving logs: ' + error.message);
    }
  },

  /**
   * Export logs as JSON
   * @returns {string} JSON string of logs
   */
  exportAsJSON: function() {
    return JSON.stringify(this.messages, null, 2);
  },

  /**
   * Export logs as CSV
   * @returns {string} CSV string of logs
   */
  exportAsCSV: function() {
    if (this.messages.length === 0) return 'timestamp,level,message,data';

    const header = 'timestamp,level,message,data';
    const rows = this.messages.map(log =>
      `"${log.timestamp}","${log.level}","${log.message}","${JSON.stringify(log.data)}"`
    );

    return [header, ...rows].join('\n');
  }
};
