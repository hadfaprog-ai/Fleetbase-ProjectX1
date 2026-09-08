/* ════════════════════════════════════════════════════
   WIM Online — Shared App Utilities
   ════════════════════════════════════════════════════ */

// ── Session helpers
const Session = {
  get(key, fallback = null) {
    return sessionStorage.getItem(key) || fallback;
  },
  set(key, value) {
    sessionStorage.setItem(key, value);
  },
  clear() {
    sessionStorage.clear();
  },

  // Check server-side session and init API
  async restoreAPI() {
    try {
      const resp = await fetch(WIM_CONFIG.auth.sessionURL);
      const data = await resp.json();
      if (data.user) {
        const pid = data.user.driver_id || '';
        this.set(WIM_CONFIG.session.userNameKey, data.user.name || '');
        this.set(WIM_CONFIG.session.userRoleKey, data.user.role || '');
        this.set(WIM_CONFIG.session.driverIdKey, pid);
        WIM_API.init({ driverId: pid });
        return data.user;
      }
    } catch (e) {
      // Fallback to sessionStorage
      const pid = this.get(WIM_CONFIG.session.driverIdKey, '');
      WIM_API.init({ driverId: pid });
    }
    // No valid session
    return null;
  },

  async checkOrRedirect() {
    const user = await this.restoreAPI();
    if (!user) {
      window.location.href = 'index.html';
      return false;
    }
    return user;
  },

  async handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    this.clear();
    window.location.href = 'index.html';
  }
};

// ── Active bottom nav
function setActiveNav(page) {
  document.querySelectorAll('.bottom-nav a').forEach(a => a.classList.remove('active'));
  const el = document.querySelector(`.bottom-nav a[href$="${page}"]`);
  if (el) el.classList.add('active');
}

// ── Visit Timer
class VisitTimer {
  constructor(seconds, onTick, onDone) {
    this.total = seconds;
    this.remaining = seconds;
    this.onTick = onTick;
    this.onDone = onDone;
    this.interval = null;
    this.isDone = false;
  }

  get formatted() {
    const m = Math.floor(this.remaining / 60);
    const s = this.remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  start() {
    if (this.interval) return;
    this.interval = setInterval(() => {
      this.remaining--;
      if (this.onTick) this.onTick(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        this.isDone = true;
        if (this.onDone) this.onDone();
      }
    }, 1000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }
}

// ── Camera capture
async function capturePhoto(facingMode = 'environment') {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);
    stream.getTracks().forEach(t => t.stop());

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
        resolve(file);
      }, 'image/jpeg', 0.85);
    });
  } catch (e) {
    console.error('Camera error:', e);
    alert('Tidak bisa mengakses kamera. Periksa izin kamera.');
    return null;
  }
}

// ── Download helpers
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadCSV(headers, rows, filename) {
  let csv = headers.join(',') + '\n';
  csv += rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}