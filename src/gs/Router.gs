/**
 * EduTech Framework - Router Module
 * @fileoverview HTTP routing for API endpoints
 * @version 1.0.0
 */

/**
 * Router singleton
 * @type {Object}
 */
const Router = {
  /**
   * Route map
   */
  routes: {},

  /**
   * Register route
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Function} handler - Handler function
   * @returns {void}
   */
  register: function(method, path, handler) {
    const key = `${method.toUpperCase()} ${path}`;
    this.routes[key] = handler;
    Logger_.debug(`Route registered: ${key}`);
  },

  /**
   * Handle request
   * @param {string} method - HTTP method
   * @param {string} path - API path
   * @param {Object} data - Request data
   * @returns {Object} Response
   */
  handle: function(method, path, data) {
    try {
      // Check authentication
      const auth = Auth.verify();
      if (!auth.authenticated && !this._isPublicPath(path)) {
        return this.response(401, 'Unauthorized', null);
      }

      const key = `${method.toUpperCase()} ${path}`;
      const handler = this.routes[key];

      if (!handler) {
        return this.response(404, 'Route not found', null);
      }

      // Execute handler
      const result = handler(data, auth);
      return result;
    } catch (error) {
      Logger_.error(`Router error: ${error.message}`);
      return this.response(500, 'Internal server error', null);
    }
  },

  /**
   * Generate response
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Response message
   * @param {*} data - Response data
   * @returns {Object} Response object
   */
  response: function(statusCode, message, data) {
    return {
      status: statusCode,
      success: statusCode >= 200 && statusCode < 300,
      message: message,
      data: data,
      timestamp: new Date().toISOString()
    };
  },

  /**
   * Check if path is public
   * @private
   * @param {string} path - API path
   * @returns {boolean} True if public
   */
  _isPublicPath: function(path) {
    const publicPaths = ['/api/auth/login', '/api/auth/register', '/api/health'];
    return publicPaths.some(p => path.startsWith(p));
  }
};

/**
 * Initialize routes
 * @returns {void}
 */
function initializeRoutes() {
  // Auth routes
  Router.register('POST', '/api/auth/login', function(data) {
    const result = Auth.login(data.email, data.password);
    if (result.success) {
      return Router.response(200, result.message, result.session);
    }
    return Router.response(401, result.message, null);
  });

  Router.register('POST', '/api/auth/logout', function(data) {
    const result = Auth.logout();
    if (result.success) {
      return Router.response(200, result.message, null);
    }
    return Router.response(400, result.message, null);
  });

  // Health check
  Router.register('GET', '/api/health', function() {
    return Router.response(200, 'Service is healthy', { timestamp: new Date().toISOString() });
  });

  Logger_.info('Routes initialized');
}

// Initialize routes on script load
if (typeof initializeRoutes === 'function') {
  initializeRoutes();
}
