/* ════════════════════════════════════════════════════
   WIM Online — Config File
   Centralized configuration for API keys, endpoints, etc.
   API keys are now injected server-side via session.
   ════════════════════════════════════════════════════ */

const WIM_CONFIG = {
  // ── App
  app: {
    name: 'WIM Online',
    version: '1.0',
    environment: 'staging',
    company: 'PT Wahana Inti Mas',
  },

  // ── Auth endpoints (server-side, relative to same origin)
  auth: {
    loginURL: '/api/auth/login',
    logoutURL: '/api/auth/logout',
    sessionURL: '/api/auth/session',
  },

  // ── Fleetbase API
  api: {
    baseURL: '/v1',        // Proxied via server
    driverId: null,        // Set after login from session
  },

  // ── Session storage keys (for frontend user info only)
  session: {
    userNameKey: 'wim_user_name',
    userEmailKey: 'wim_user_email',
    userRoleKey: 'wim_user_role',
    driverIdKey: 'wim_driver_id',
  },

  // ── Logging
  logging: {
    enabled: true,
    serverEndpoint: '/api/log',
    consoleEnabled: true,
  },

  // ── Features
  features: {
    timerDuration: 180,
    mandatorySelfie: true,
    allowMultiplePhotos: true,
    geofenceRadiusMeters: 10,
  },
};