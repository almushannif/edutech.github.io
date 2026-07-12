/**
 * EduTech Framework - Database Module
 * @fileoverview Spreadsheet database operations and data access
 * @version 1.0.0
 */

/**
 * Database singleton
 * @type {Object}
 */
const Database = {
  /**
   * Get spreadsheet
   * @returns {Spreadsheet} Active spreadsheet
   */
  getSpreadsheet: function() {
    return SpreadsheetApp.getActive();
  },

  /**
   * Get sheet by name
   * @param {string} sheetName - Sheet name
   * @returns {Sheet} Sheet object
   */
  getSheet: function(sheetName) {
    const sheet = this.getSpreadsheet().getSheetByName(sheetName);
    if (!sheet) {
      throw new Error('Sheet not found: ' + sheetName);
    }
    return sheet;
  },

  /**
   * Get all data from sheet
   * @param {string} sheetName - Sheet name
   * @returns {Array} Array of records
   */
  getAllData: function(sheetName) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    if (data.length <= 1) return [];

    const headers = data[0];
    const records = [];

    for (let i = 1; i < data.length; i++) {
      const record = {};
      for (let j = 0; j < headers.length; j++) {
        record[headers[j]] = data[i][j];
      }
      records.push(record);
    }

    return records;
  },

  /**
   * Find user by email
   * @param {Object} filter - Filter criteria
   * @returns {Object} User object or null
   */
  findUser: function(filter) {
    const users = this.getAllData('Users');
    return users.find(user => {
      for (const key in filter) {
        if (user[key] !== filter[key]) return false;
      }
      return true;
    }) || null;
  },

  /**
   * Create user
   * @param {Object} userData - User data
   * @returns {Object} Created user
   */
  createUser: function(userData) {
    const sheet = this.getSheet('Users');
    const user = {
      id: Utilities_.generateId(),
      email: userData.email,
      name: userData.name,
      password: Utilities_.hashPassword(userData.password),
      role: userData.role || 'User',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => user[header] || '');

    sheet.appendRow(row);
    Audit.log(user.id, 'CREATE_USER', 'User created', { email: userData.email });

    return user;
  },

  /**
   * Update user
   * @param {string} userId - User ID
   * @param {Object} updates - Update data
   * @returns {Object} Updated user
   */
  updateUser: function(userId, updates) {
    const sheet = this.getSheet('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('id')] === userId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('User not found: ' + userId);
    }

    updates.updatedAt = new Date();
    const row = headers.map(header => updates[header] !== undefined ? updates[header] : data[rowIndex][headers.indexOf(header)]);

    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([row]);
    Audit.log(userId, 'UPDATE_USER', 'User updated', updates);

    return { id: userId, ...updates };
  },

  /**
   * Delete user
   * @param {string} userId - User ID
   * @returns {boolean} True if deleted
   */
  deleteUser: function(userId) {
    const sheet = this.getSheet('Users');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('id')] === userId) {
        sheet.deleteRow(i + 1);
        Audit.log(userId, 'DELETE_USER', 'User deleted', {});
        return true;
      }
    }

    return false;
  },

  /**
   * Get role permissions
   * @param {string} role - Role name
   * @returns {Array} Array of permissions
   */
  getRolePermissions: function(role) {
    try {
      const roles = this.getAllData('Roles');
      const roleObj = roles.find(r => r.name === role);

      if (!roleObj) return [];

      const permissions = this.getAllData('Permissions');
      return permissions
        .filter(p => p.role === role)
        .map(p => p.permission);
    } catch (error) {
      Logger_.error('Error getting role permissions: ' + error.message);
      return [];
    }
  },

  /**
   * Insert record
   * @param {string} sheetName - Sheet name
   * @param {Object} record - Record data
   * @returns {Object} Inserted record with ID
   */
  insertRecord: function(sheetName, record) {
    const sheet = this.getSheet(sheetName);
    record.id = Utilities_.generateId();
    record.createdAt = new Date();
    record.updatedAt = new Date();

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const row = headers.map(header => record[header] || '');

    sheet.appendRow(row);
    Audit.log(record.id, 'INSERT', 'Record inserted in ' + sheetName, record);

    return record;
  },

  /**
   * Update record
   * @param {string} sheetName - Sheet name
   * @param {string} recordId - Record ID
   * @param {Object} updates - Update data
   * @returns {Object} Updated record
   */
  updateRecord: function(sheetName, recordId, updates) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    let rowIndex = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('id')] === recordId) {
        rowIndex = i;
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Record not found: ' + recordId);
    }

    updates.updatedAt = new Date();
    const row = headers.map(header => updates[header] !== undefined ? updates[header] : data[rowIndex][headers.indexOf(header)]);

    sheet.getRange(rowIndex + 1, 1, 1, headers.length).setValues([row]);
    Audit.log(recordId, 'UPDATE', 'Record updated in ' + sheetName, updates);

    return { id: recordId, ...updates };
  },

  /**
   * Delete record
   * @param {string} sheetName - Sheet name
   * @param {string} recordId - Record ID
   * @returns {boolean} True if deleted
   */
  deleteRecord: function(sheetName, recordId) {
    const sheet = this.getSheet(sheetName);
    const data = sheet.getDataRange().getValues();
    const headers = data[0];

    for (let i = 1; i < data.length; i++) {
      if (data[i][headers.indexOf('id')] === recordId) {
        sheet.deleteRow(i + 1);
        Audit.log(recordId, 'DELETE', 'Record deleted from ' + sheetName, {});
        return true;
      }
    }

    return false;
  }
};
