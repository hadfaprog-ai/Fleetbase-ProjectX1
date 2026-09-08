/* ════════════════════════════════════════════════════
   WIM Fleetbase — API Client Module
   Auth is server-side via session cookie (credentials: same-origin)
   ════════════════════════════════════════════════════ */

// ── Error Logger
const WIM_LOGGER = {
  _enabled: true,

  info(context, message, data = null) {
    if (!this._enabled || !WIM_CONFIG.logging.enabled) return;
    const entry = { level: 'INFO', context, message, data, ts: new Date().toISOString() };
    if (WIM_CONFIG.logging.consoleEnabled) console.log(`[WIM ${entry.level}] [${context}] ${message}`, data || '');
    if (WIM_CONFIG.logging.serverEndpoint) this._send(entry);
  },

  warn(context, message, data = null) {
    if (!this._enabled || !WIM_CONFIG.logging.enabled) return;
    const entry = { level: 'WARN', context, message, data, ts: new Date().toISOString() };
    if (WIM_CONFIG.logging.consoleEnabled) console.warn(`[WIM ${entry.level}] [${context}] ${message}`, data || '');
    if (WIM_CONFIG.logging.serverEndpoint) this._send(entry);
  },

  error(context, message, data = null) {
    if (!this._enabled || !WIM_CONFIG.logging.enabled) return;
    const entry = { level: 'ERROR', context, message, data, ts: new Date().toISOString() };
    if (WIM_CONFIG.logging.consoleEnabled) console.error(`[WIM ${entry.level}] [${context}] ${message}`, data || '');
    if (WIM_CONFIG.logging.serverEndpoint) this._send(entry);
  },

  _send(entry) {
    try {
      fetch(WIM_CONFIG.logging.serverEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(entry),
      }).catch(() => {});
    } catch (e) {}
  },
};

const WIM_API = {
  baseURL: null,
  driverId: null,

  init(config) {
    this.baseURL = config?.baseURL || WIM_CONFIG.api.baseURL;
    this.driverId = config?.driverId || WIM_CONFIG.api.driverId;
    WIM_LOGGER.info('API', 'API initialized', { baseURL: this.baseURL });
  },

  async request(method, path, data = null) {
    const url = `${this.baseURL}${path}`;
    const opts = {
      method,
      credentials: 'same-origin',  // ⚡ sends session cookie to proxy
      headers: {
        'Accept': 'application/json',
      },
    };
    if (data && !(data instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      // Don't set Content-Type — browser sets it with boundary for FormData
      opts.body = data;
    }
    try {
      const resp = await fetch(url, opts);
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        const msg = `API ${resp.status}: ${errBody.slice(0, 200)}`;
        WIM_LOGGER.error('API', msg, { method, path, status: resp.status });
        throw new Error(msg);
      }
      const result = await resp.json();
      WIM_LOGGER.info('API', `${method} ${path} → 200`, { status: 200 });
      return result;
    } catch (e) {
      if (e.name !== 'Error') throw e;
      const msg = `Network error: ${e.message}`;
      WIM_LOGGER.error('API', msg, { method, path });
      throw new Error(msg);
    }
  },

  get(path) { return this.request('GET', path); },
  post(path, data) { return this.request('POST', path, data); },
  patch(path, data) { return this.request('PATCH', path, data); },
  del(path) { return this.request('DELETE', path); },

  // ── Domain helpers
  async getPlaces() {
    try {
      const data = await this.get('/places');
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getPlaces failed', e.message);
      return [];
    }
  },

  async getEntities(params = '') {
    try {
      const data = await this.get(`/entities${params}`);
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getEntities failed', e.message);
      return [];
    }
  },

  async getOrders(params = '') {
    try {
      const data = await this.get(`/orders${params}`);
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getOrders failed', e.message);
      return [];
    }
  },

  async createOrder(orderData) {
    try {
      return await this.post('/orders', orderData);
    } catch (e) {
      WIM_LOGGER.error('API', 'createOrder failed', { error: e.message, orderData });
      throw e;
    }
  },

  async trackDriver(lat, lng) {
    try {
      return await this.post(`/drivers/${this.driverId}/track`, {
        latitude: lat,
        longitude: lng,
        location: { type: 'Point', coordinates: [lng, lat] }
      });
    } catch (e) {
      WIM_LOGGER.error('API', 'trackDriver failed', { lat, lng, error: e.message });
      throw e;
    }
  },

  async uploadPhoto(formData) {
    try {
      return await this.post(`/drivers/${this.driverId}/track`, formData);
    } catch (e) {
      WIM_LOGGER.error('API', 'uploadPhoto failed', e.message);
      throw e;
    }
  },

  async getZones() {
    try {
      const data = await this.get('/zones');
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getZones failed', e.message);
      return [];
    }
  },

  async getGeofenceEvents(params = '') {
    try {
      const data = await this.get(`/geofences/events${params}`);
      if (data && data.data && Array.isArray(data.data)) return data.data;
      if (data && data.current_page != null && Array.isArray(data.data)) return data.data;
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getGeofenceEvents failed', e.message);
      return [];
    }
  },

  async getContacts() {
    try {
      const data = await this.get('/contacts');
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getContacts failed', e.message);
      return [];
    }
  },

  async createPlace(placeData) {
    try {
      return await this.post('/places', placeData);
    } catch (e) {
      WIM_LOGGER.error('API', 'createPlace failed', { error: e.message, placeData });
      throw e;
    }
  },

  async createContact(contactData) {
    try {
      return await this.post('/contacts', contactData);
    } catch (e) {
      WIM_LOGGER.error('API', 'createContact failed', { error: e.message, contactData });
      throw e;
    }
  },

  async updateOrder(id, updateData) {
    try {
      return await this.patch(`/orders/${id}`, updateData);
    } catch (e) {
      WIM_LOGGER.error('API', 'updateOrder failed', { id, error: e.message });
      throw e;
    }
  },

  async getRoutes() {
    try {
      const data = await this.get('/routes');
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getRoutes failed', e.message);
      return [];
    }
  },

  async getDrivers() {
    try {
      const data = await this.get('/drivers');
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getDrivers failed', e.message);
      return [];
    }
  },

  async getVehicles() {
    try {
      const data = await this.get('/vehicles');
      return Array.isArray(data) ? data : (data.data || []);
    } catch (e) {
      WIM_LOGGER.error('API', 'getVehicles failed', e.message);
      return [];
    }
  },
};