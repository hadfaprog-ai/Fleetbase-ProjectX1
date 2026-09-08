/* ════════════════════════════════════════════════════
   WIM Fleetbase — API Client Module
   ════════════════════════════════════════════════════ */

const WIM_API = {
  baseURL: null,
  token: null,
  driverId: null,
  companyId: null,

  init(config) {
    this.baseURL = config.baseURL || 'http://192.168.6.223:8000/v1';
    this.token = config.token || 'flb_live_RgeKNhT7Pg8rCcuXp8sD';
    this.driverId = config.driverId || null;
    this.companyId = config.companyId || null;
  },

  async request(method, path, data = null) {
    const url = `${this.baseURL}${path}`;
    const opts = {
      method,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Accept': 'application/json',
      },
    };
    if (data && !(data instanceof FormData)) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(data);
    } else if (data instanceof FormData) {
      opts.body = data;
    }
    try {
      const resp = await fetch(url, opts);
      if (!resp.ok) {
        const errBody = await resp.text().catch(() => '');
        throw new Error(`API ${resp.status}: ${errBody.slice(0, 100)}`);
      }
      return await resp.json();
    } catch (e) {
      if (e.name !== 'Error') throw e;
      throw new Error(`Network error: ${e.message}`);
    }
  },

  get(path) { return this.request('GET', path); },
  post(path, data) { return this.request('POST', path, data); },
  patch(path, data) { return this.request('PATCH', path, data); },
  del(path) { return this.request('DELETE', path); },

  // ── Domain helpers
  async getPlaces() {
    const data = await this.get('/places');
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getEntities(params = '') {
    const data = await this.get(`/entities${params}`);
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getOrders(params = '') {
    const data = await this.get(`/orders${params}`);
    return Array.isArray(data) ? data : (data.data || []);
  },

  async createOrder(orderData) {
    return await this.post('/orders', orderData);
  },

  async trackDriver(lat, lng) {
    return await this.post(`/drivers/${this.driverId}/track`, {
      latitude: lat,
      longitude: lng,
      location: { type: 'Point', coordinates: [lng, lat] }
    });
  },

  async uploadPhoto(formData) {
    return await this.post(`/drivers/${this.driverId}/track`, formData);
  },

  async getZones() {
    const data = await this.get('/zones');
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getGeofenceEvents(params = '') {
    const data = await this.get(`/geofences/events${params}`);
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getContacts() {
    const data = await this.get('/contacts');
    return Array.isArray(data) ? data : (data.data || []);
  },

  async createPlace(placeData) {
    return await this.post('/places', placeData);
  },

  async createContact(contactData) {
    return await this.post('/contacts', contactData);
  },

  async updateOrder(id, updateData) {
    return await this.patch(`/orders/${id}`, updateData);
  },

  async getRoutes() {
    const data = await this.get('/routes');
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getDrivers() {
    const data = await this.get('/drivers');
    return Array.isArray(data) ? data : (data.data || []);
  },

  async getVehicles() {
    const data = await this.get('/vehicles');
    return Array.isArray(data) ? data : (data.data || []);
  },
};