/**
 * EduTech Framework - Main Entry Point
 * @fileoverview Core application initialization and Google Apps Script lifecycle
 * @version 1.0.0
 * @author EduTech Team
 */

/**
 * Global configuration and app state
 * @type {Object}
 */
const APP = {
  name: 'EduTech Framework',
  version: '1.0.0',
  environment: 'production',
  debug: false,
  cache: CacheService.getUserCache(),
  properties: PropertiesService.getUserProperties(),
  scriptProperties: PropertiesService.getScriptProperties(),
  documentProperties: PropertiesService.getDocumentProperties()
};

/**
 * Initialize the application on spreadsheet open
 * Creates menu items and sets up initial state
 * @returns {void}
 */
function onOpen() {
  try {
    const ui = SpreadsheetApp.getUi();
    const menu = ui.createMenu('EduTech');

    menu.addItem('Dashboard', 'openDashboard');
    menu.addItem('Login', 'openLogin');
    menu.addSeparator();
    menu.addItem('Settings', 'openSettings');
    menu.addItem('Audit Log', 'openAuditLog');
    menu.addSeparator();
    menu.addItem('About', 'showAbout');
    menu.addToUi();

    Logger_.info('Application initialized successfully');
  } catch (error) {
    Logger_.error('Error in onOpen: ' + error.message);
  }
}

/**
 * Install function for script triggers
 * Sets up time-based and event-based triggers
 * @returns {void}
 */
function onInstall() {
  onOpen();
  setupTriggers();
  Logger_.info('Installation completed');
}

/**
 * Setup automatic triggers for background tasks
 * @returns {void}
 */
function setupTriggers() {
  // Remove existing triggers
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));

  // Create new triggers
  ScriptApp.newTrigger('onOpen')
    .forSpreadsheet(SpreadsheetApp.getActive())
    .onOpen()
    .create();

  ScriptApp.newTrigger('dailyMaintenance')
    .timeBased()
    .everyDays(1)
    .atHour(2)
    .create();

  Logger_.info('Triggers setup completed');
}

/**
 * Daily maintenance task
 * Cleans up cache, logs, and performs housekeeping
 * @returns {void}
 */
function dailyMaintenance() {
  try {
    // Clear old cache
    APP.cache.removeAll(APP.cache.getAllKeys());

    // Archive old logs
    Logger_.archiveLogs();

    // Cleanup old audit entries
    Audit.cleanupOldEntries();

    Logger_.info('Daily maintenance completed');
  } catch (error) {
    Logger_.error('Error in dailyMaintenance: ' + error.message);
  }
}

/**
 * Open dashboard
 * @returns {void}
 */
function openDashboard() {
  const auth = Auth.verify();
  if (!auth.authenticated) {
    openLogin();
    return;
  }

  const html = HtmlService.createHtmlOutputFromFile('Dashboard')
    .setWidth(800)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Dashboard');
}

/**
 * Open login dialog
 * @returns {void}
 */
function openLogin() {
  const html = HtmlService.createHtmlOutputFromFile('Login')
    .setWidth(500)
    .setHeight(600);
  SpreadsheetApp.getUi().showModalDialog(html, 'Login');
}

/**
 * Open settings dialog
 * @returns {void}
 */
function openSettings() {
  const auth = Auth.verify();
  if (!auth.authenticated) {
    SpreadsheetApp.getUi().alert('Please login first');
    return;
  }

  if (!Auth.hasPermission('ADMIN')) {
    SpreadsheetApp.getUi().alert('You do not have permission to access settings');
    return;
  }

  const html = HtmlService.createHtmlOutputFromFile('Settings')
    .setWidth(900)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'Settings');
}

/**
 * Open audit log dialog
 * @returns {void}
 */
function openAuditLog() {
  const auth = Auth.verify();
  if (!auth.authenticated) {
    SpreadsheetApp.getUi().alert('Please login first');
    return;
  }

  if (!Auth.hasPermission('ADMIN')) {
    SpreadsheetApp.getUi().alert('You do not have permission to view audit logs');
    return;
  }

  const html = HtmlService.createHtmlOutputFromFile('AuditLog')
    .setWidth(1000)
    .setHeight(700);
  SpreadsheetApp.getUi().showModalDialog(html, 'Audit Log');
}

/**
 * Show about dialog
 * @returns {void}
 */
function showAbout() {
  const html = HtmlService.createHtmlOutput(
    '<h2>' + APP.name + '</h2>' +
    '<p>Version: ' + APP.version + '</p>' +
    '<p>A production-ready enterprise framework for Google Apps Script</p>' +
    '<p><b>Features:</b></p>' +
    '<ul>' +
    '<li>Authentication & Authorization</li>' +
    '<li>Dynamic CRUD Operations</li>' +
    '<li>Dashboard & Analytics</li>' +
    '<li>File Management</li>' +
    '<li>Email & Calendar Integration</li>' +
    '<li>Audit Trail & Logging</li>' +
    '</ul>' +
    '<p>© 2024 EduTech Team. All rights reserved.</p>'
  );
  SpreadsheetApp.getUi().showModelessDialog(html, 'About EduTech Framework');
}
