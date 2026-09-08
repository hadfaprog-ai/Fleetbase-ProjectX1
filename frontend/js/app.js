/* ════════════════════════════════════════════════════
   WIM Fleetbase — Shared App Utilities
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
  restoreAPI() {
    const token = this.get('wim_token', 'flb_live_RgeKNhT7Pg8rCcuXp8sD');
    const baseURL = this.get('wim_base_url', 'http://192.168.6.223:8000/v1');
    const driverId = this.get('wim_driver_id', 'bdd47b89-9ca9-4452-a29c-2bc603347c78');
    WIM_API.init({ token, baseURL, driverId });
  }
};

// ── Active bottom nav
function setActiveNav(page) {
  const links = document.querySelectorAll('.bottom-nav a');
  links.forEach(a => {
    const href = a.getAttribute('href');
    a.classList.toggle('active', href === page);
  });
}

// ── Format helpers
function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatTime(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

function formatDateTime(dateStr) {
  if (!dateStr) return '';
  return `${formatDate(dateStr)} ${formatTime(dateStr)}`;
}

// ── Timer (3-minute minimum visit)
class VisitTimer {
  constructor(durationSeconds = 180, onTick = null, onDone = null) {
    this.duration = durationSeconds;
    this.remaining = durationSeconds;
    this.onTick = onTick;
    this.onDone = onDone;
    this.interval = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.remaining = this.duration;
    this.interval = setInterval(() => {
      this.remaining--;
      if (this.onTick) this.onTick(this.remaining);
      if (this.remaining <= 0) {
        this.stop();
        if (this.onDone) this.onDone();
      }
    }, 1000);
  }

  stop() {
    this.running = false;
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  }

  get formatted() {
    const m = Math.floor(this.remaining / 60);
    const s = this.remaining % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }

  get isDone() {
    return this.remaining <= 0;
  }
}

// ── Camera capture helper
async function capturePhoto(facingMode = 'environment') {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    return new Promise((resolve) => {
      setTimeout(() => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0);
        stream.getTracks().forEach(t => t.stop());

        canvas.toBlob((blob) => {
          const file = new File([blob], 'photo.jpg', { type: 'image/jpeg' });
          resolve(file);
        }, 'image/jpeg', 0.8);
      }, 500);
    });
  } catch (e) {
    console.error('Camera error:', e);
    return null;
  }
}

// ── QR Scanner (jsQR)
async function scanQRCode() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
    });
    const video = document.createElement('video');
    video.srcObject = stream;
    video.play();

    // Try to detect QR for 5 seconds
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      let attempts = 0;
      const maxAttempts = 50;

      const check = () => {
        if (attempts >= maxAttempts) {
          stream.getTracks().forEach(t => t.stop());
          resolve(null);
          return;
        }
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Try jsQR if loaded
        if (typeof jsQR === 'function') {
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            stream.getTracks().forEach(t => t.stop());
            resolve(code.data);
            return;
          }
        }
        attempts++;
        setTimeout(check, 100);
      };
      setTimeout(check, 500);
    });
  } catch (e) {
    console.error('QR scan error:', e);
    return null;
  }
}

// ── Export download helper
function downloadJSON(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── Init on every page
document.addEventListener('DOMContentLoaded', () => {
  Session.restoreAPI();
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  setActiveNav(currentPage);
});