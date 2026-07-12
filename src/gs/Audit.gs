/**
 * EduTech Framework - Audit Module
 * @fileoverview Audit logging and compliance tracking
 * @version 1.0.0
 */

/**
 * Audit singleton
 * @type {Object}
 */
const Audit = {
  /**
   * Log audit event
   * @param {string} userId - User ID
   * @param {string} action - Action type
   * @param {string} description - Description
   * @param {Object} data - Additional data
   * @returns {void}
   */
  log: function(userId, action, description, data = {}) {
    try {
      const sheet = Database.getSheet('Audit');
      const auditEntry = [
        Utilities_.generateId(),
        userId,
        action,
        description,
        JSON.stringify(data),
        Utilities_.formatDate(new Date()),
        Session.getActiveUser().getEmail() || 'system'
      ];

      sheet.appendRow(auditEntry);
      Logger_.debug(`Audit logged: ${action} by ${userId}`);
    } catch (error) {
      Logger_.error('Audit log error: ' + error.message);
    }
  },

  /**
   * Get audit log
   * @param {Object} filter - Filter criteria
   * @returns {Array} Audit entries
   */
  getLog: function(filter = {}) {
    try {
      const logs = Database.getAllData('Audit');
      return Utilities_.filterArray(logs, filter);
    } catch (error) {
      Logger_.error('Error retrieving audit log: ' + error.message);
      return [];
    }
  },

  /**
   * Cleanup old audit entries (older than 90 days)
   * @returns {void}
   */
  cleanupOldEntries: function() {
    try {
      const sheet = Database.getSheet('Audit');
      const data = sheet.getDataRange().getValues();
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

      let rowsDeleted = 0;
      for (let i = data.length - 1; i > 0; i--) {
        const entryDate = new Date(data[i][5]);
        if (entryDate < ninetyDaysAgo) {
          sheet.deleteRow(i + 1);
          rowsDeleted++;
        }
      }

      if (rowsDeleted > 0) {
        Logger_.info(`Cleaned up ${rowsDeleted} old audit entries`);
      }
    } catch (error) {
      Logger_.error('Error cleaning up audit entries: ' + error.message);
    }
  }
};
