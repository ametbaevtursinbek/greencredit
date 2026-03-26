
Copy

/* ============================
   EcoCarbon Pro — app.js
   Frontend Logic
   ============================ */
 
// ====================== CONFIG / DATA ======================
const RATIOS = { Archa: 22, Chinor: 45, Mevali: 15, Terak: 30 };
const CREDIT_PRICE = 65;
const EMOJIS = { Archa: '🌲', Chinor: '🌳', Mevali: '🍎', Terak: '🌴' };
 
// API base URL — backend serverni manzili
const API_BASE = 'http://localhost:3000/api';
 
let treeDB = [
  { id: 'A1B2C3', turi: 'Chinor', yoshi: 10, lat: 41.3111, lon: 69.2405, kredit: 0.45,  daromad: 29.25 },
  { id: 'D4E5F6', turi: 'Archa',  yoshi: 5,  lat: 41.3200, lon: 69.2500, kredit: 0.11,  daromad: 7.15  }
];
 
const marketData = [
  { id: 'MKT001', turi: 'Chinor', yoshi: 15, lat: 41.29, lon: 69.25, kredit: 0.675, daromad: 43.88, owner: 'Karimov F.',  city: 'Toshkent' },
  { id: 'MKT002', turi: 'Archa',  yoshi: 8,  lat: 41.34, lon: 69.21, kredit: 0.176, daromad: 11.44, owner: 'Rahimova M.', city: 'Chirchiq'  },
  { id: 'MKT003', turi: 'Terak',  yoshi: 12, lat: 41.28, lon: 69.30, kredit: 0.36,  daromad: 23.40, owner: 'Umarov B.',   city: 'Toshkent'  },
  { id: 'MKT004', turi: 'Mevali', yoshi: 7,  lat: 41.32, lon: 69.22, kredit: 0.105, daromad: 6.83,  owner: 'Nazarova D.', city: 'Angren'    },
  { id: 'MKT005', turi: 'Chinor', yoshi: 20, lat: 41.27, lon: 69.28, kredit: 0.90,  daromad: 58.50, owner: 'Xasanov A.',  city: 'Toshkent'  },
  { id: 'MKT006', turi: 'Archa',  yoshi: 3,  lat: 41.35, lon: 69.20, kredit: 0.066, daromad: 4.29,  owner: 'Toshmatov S.', city: 'Olmaliq'  }
];
 
let currentUser  = null;
let mapInstance  = null;
 
// ====================== AUTH ======================
function switchTab(tab) {
  document.querySelectorAll('.auth-tab').forEach((t, i) =>
    t.classList.toggle('active', tab === 'login' ? i === 0 : i === 1)
  );
  document.getElementById('login-form').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('register-form').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('auth-error').style.display    = 'none';
}
 
function showError(msg) {
  const el = document.getElementById('auth-error');
  el.textContent   = msg;
  el.style.display = 'block';
}
 
function doLogin() {
  const email = document.getElementById('login-email').value.trim();
  const pass  = document.getElementById('login-pass').value;
  if (!email || !pass) return showError('Email va parol kiritish shart.');
  if (pass.length < 6) return showError("Parol kamida 6 ta belgi bo'lishi kerak.");
 
  // Backend orqali login qilish
  fetch(`${API_BASE}/auth/login`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ email, password: pass })
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) return showError(data.error);
      loginSuccess(data.user);
    })
    .catch(() => {
      // Fallback: demo rejim
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      loginSuccess({ name, email, provider: 'email' });
    });
}
 
function doRegister() {
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim();
  const pass  = document.getElementById('reg-pass').value;
  if (!name || !email || !pass) return showError("Barcha maydonlarni to'ldiring.");
  if (pass.length < 6) return showError("Parol kamida 6 ta belgi bo'lishi kerak.");
  if (!email.includes('@')) return showError("Email manzil noto'g'ri.");
 
  // Backend orqali ro'yxatdan o'tish
  fetch(`${API_BASE}/auth/register`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ name, email, password: pass })
  })
    .then(r => r.json())
    .then(data => {
      if (data.error) return showError(data.error);
      loginSuccess({ name, email, provider: 'email' });
    })
    .catch(() => {
      loginSuccess({ name, email, provider: 'email' });
    });
}
 
function googleLogin() {
  const btn = document.querySelector('.btn-google');
  btn.innerHTML = '<div class="spin"></div> Ulanmoqda...';
  // Real Google OAuth integratsiyasi uchun backend /api/auth/google ishlatiladi
  setTimeout(() => {
    loginSuccess({ name: 'Google Foydalanuvchi', email: 'user@gmail.com', provider: 'google' });
  }, 1500);
}
 
function loginSuccess(user) {
  currentUser = user;
  document.getElementById('auth-screen').style.display    = 'none';
  document.getElementById('app').style.display            = 'block';
  document.getElementById('user-name-display').textContent = user.name;
  document.getElementById('user-email-display').textContent = user.email;
  document.getElementById('user-avatar').textContent       = user.name.charAt(0).toUpperCase();
  initApp();
}
 
function doLogout() {
  currentUser = null;
  document.getElementById('auth-screen').style.display = 'flex';
  document.getElementById('app').style.display         = 'none';
  const googleSVG = `<svg class="google-icon" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg> Google bilan kirish`;
  document.querySelector('.btn-google').innerHTML = googleSVG;
}
 
// ====================== APP INIT ======================
function initApp() {
  loadTrees();   // Backend dan daraxtlarni yuklash
  renderMarket(marketData);
  updateMetrics();
  setTimeout(initMap, 100);
  calcPreview();
}
 
// Backend dan daraxtlarni yuklash
function loadTrees() {
  fetch(`${API_BASE}/trees`)
    .then(r => r.json())
    .then(data => {
      if (data && data.length) {
        treeDB = data;
        renderTable();
        updateMetrics();
        if (mapInstance) initMap();
      } else {
        renderTable();
      }
    })
    .catch(() => {
      // Backend yo'q bo'lsa local data ishlatiladi
      renderTable();
    });
}
 
function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');
  const pages = ['dashboard', 'certify', 'marketplace'];
  const idx   = pages.indexOf(page);
  document.querySelectorAll('.nav-item')[idx].classList.add('active');
  if (page === 'dashboard' && mapInstance) setTimeout(() => mapInstance.invalidateSize(), 100);
}
 
// ====================== MAP ======================
function initMap() {
  if (mapInstance) mapInstance.remove();
  mapInstance = L.map('map').setView([41.3111, 69.2405], 12);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 19
  }).addTo(mapInstance);
 
  const greenIcon = L.divIcon({
    html: '<div style="background:#16a34a;width:28px;height:28px;border-radius:50%;border:3px solid #4ade80;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(74,222,128,0.5)">🌳</div>',
    className: '', iconSize: [28, 28], iconAnchor: [14, 14]
  });
 
  treeDB.forEach(row => {
    L.marker([row.lat, row.lon], { icon: greenIcon })
      .addTo(mapInstance)
      .bindPopup(`<b>${row.turi}</b><br>ID: #${row.id}<br>Kredit: ${row.kredit} t<br>Daromad: $${row.daromad}`);
  });
}
 
// ====================== TABLE ======================
function renderTable() {
  const tbody = document.getElementById('assets-body');
  tbody.innerHTML = treeDB.map(r => `
    <tr>
      <td><code style="color:var(--accent);font-size:12px">#${r.id}</code></td>
      <td>${EMOJIS[r.turi] || '🌿'} ${r.turi}</td>
      <td>${r.yoshi} yil</td>
      <td style="font-size:12px;color:var(--text-muted)">${r.lat.toFixed(4)}, ${r.lon.toFixed(4)}</td>
      <td>${(r.kredit * 1000).toFixed(1)} kg</td>
      <td>${r.kredit.toFixed(3)} t</td>
      <td style="color:var(--gold);font-weight:600">$${r.daromad.toFixed(2)}</td>
      <td><span class="badge green">✅ Tasdiqlangan</span></td>
    </tr>`).join('');
}
 
function updateMetrics() {
  const total   = treeDB.length;
  const credits = treeDB.reduce((s, r) => s + r.kredit,  0);
  const income  = treeDB.reduce((s, r) => s + r.daromad, 0);
  document.getElementById('m-trees').textContent   = total;
  document.getElementById('m-credits').textContent = credits.toFixed(3);
  document.getElementById('m-income').textContent  = '$' + income.toFixed(2);
  document.getElementById('sb-income').textContent = '$' + income.toFixed(2);
}
 
// ====================== CALC ======================
function calcPreview() {
  const type   = document.getElementById('f-type').value;
  const age    = parseFloat(document.getElementById('f-age').value) || 0;
  const kg     = (RATIOS[type] || 10) * age;
  const credit = kg / 1000;
  const income = credit * CREDIT_PRICE;
  document.getElementById('c-co2').textContent    = kg.toFixed(1) + ' kg';
  document.getElementById('c-credit').textContent = credit.toFixed(4) + ' t';
  document.getElementById('c-income').textContent = '$' + income.toFixed(2);
  document.getElementById('calc-box').style.display  = 'block';
  document.getElementById('cert-btn').style.display  = 'inline-block';
}
 
// ====================== CERTIFY ======================
function certifyTree() {
  const type    = document.getElementById('f-type').value;
  const age     = parseFloat(document.getElementById('f-age').value)   || 5;
  const lat     = parseFloat(document.getElementById('f-lat').value)   || 41.31;
  const lon     = parseFloat(document.getElementById('f-lon').value)   || 69.24;
  const height  = parseFloat(document.getElementById('f-height').value) || 3.0;
  const kg      = (RATIOS[type] || 10) * age;
  const kredit  = parseFloat((kg / 1000).toFixed(4));
  const daromad = parseFloat((kredit * CREDIT_PRICE).toFixed(2));
  const id      = Math.random().toString(36).substr(2, 6).toUpperCase();
 
  const newTree = { id, turi: type, yoshi: age, lat, lon, kredit, daromad };
 
  // Backend ga saqlash
  fetch(`${API_BASE}/trees`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ ...newTree, height, owner: currentUser?.email || 'demo' })
  })
    .then(r => r.json())
    .catch(() => null)
    .finally(() => {
      treeDB.push(newTree);
 
      // Xaritaga marker qo'shish
      if (mapInstance) {
        const greenIcon = L.divIcon({
          html: '<div style="background:#16a34a;width:28px;height:28px;border-radius:50%;border:3px solid #4ade80;display:flex;align-items:center;justify-content:center;font-size:14px;box-shadow:0 0 12px rgba(74,222,128,0.5)">🌳</div>',
          className: '', iconSize: [28, 28], iconAnchor: [14, 14]
        });
        L.marker([lat, lon], { icon: greenIcon })
          .addTo(mapInstance)
          .bindPopup(`<b>${type}</b><br>ID: #${id}`);
      }
 
      renderTable();
      updateMetrics();
      showToast('✅ Sertifikat Yaratildi!', `#${id} — ${type} | $${daromad.toFixed(2)}/yil`);
      showPage('dashboard');
    });
}
 
// ====================== MARKETPLACE ======================
function renderMarket(data) {
  const grid = document.getElementById('market-grid');
  grid.innerHTML = data.map(item => `
    <div class="market-card">
      <div class="market-top">
        <div class="market-type">${EMOJIS[item.turi] || '🌿'}</div>
        <div class="market-id">#${item.id}</div>
      </div>
      <div class="market-name">${item.turi}</div>
      <div class="market-loc">📍 ${item.city} · ${item.owner}</div>
      <div class="market-stats">
        <div class="market-stat">
          <div class="market-stat-val">${item.kredit.toFixed(3)}</div>
          <div class="market-stat-label">Kredit (t)</div>
        </div>
        <div class="market-stat">
          <div class="market-stat-val">${item.yoshi}</div>
          <div class="market-stat-label">Yosh (yil)</div>
        </div>
      </div>
      <div class="market-price">
        <div class="price-val">$${item.daromad.toFixed(2)}</div>
        <button class="btn-buy" onclick="buyCredit('${item.id}','${item.turi}',${item.daromad})">Sotib olish</button>
      </div>
    </div>`).join('');
}
 
function filterMarket(q) {
  const filtered = q
    ? marketData.filter(i =>
        i.turi.toLowerCase().includes(q.toLowerCase()) ||
        i.city.toLowerCase().includes(q.toLowerCase()) ||
        i.owner.toLowerCase().includes(q.toLowerCase())
      )
    : marketData;
  renderMarket(filtered);
}
 
function sortMarket(val) {
  let data = [...marketData];
  if      (val === 'price-asc')  data.sort((a, b) => a.daromad - b.daromad);
  else if (val === 'price-desc') data.sort((a, b) => b.daromad - a.daromad);
  else if (val === 'credits')    data.sort((a, b) => b.kredit  - a.kredit);
  renderMarket(data);
}
 
function buyCredit(id, turi, price) {
  // Backend orqali xarid qilish
  fetch(`${API_BASE}/market/buy`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ id, buyer: currentUser?.email || 'demo', price })
  }).catch(() => null);
 
  showToast('🛒 Kredit Sotib Olindi!', `#${id} — ${turi} · $${price.toFixed(2)}`);
}
 
// ====================== AI IMAGE CHECK ======================
async function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
 
  const preview = document.getElementById('img-preview');
  const reader  = new FileReader();
  reader.onload = async (e) => {
    preview.src          = e.target.result;
    preview.style.display = 'block';
    document.getElementById('upload-zone').querySelector('.upload-icon').textContent = '';
    document.getElementById('upload-zone').querySelector('.upload-text').textContent = '';
    await analyzeImage(e.target.result, file.name);
  };
  reader.readAsDataURL(file);
}
 
async function analyzeImage(base64, filename) {
  document.getElementById('ai-loading').style.display  = 'block';
  document.getElementById('ai-result').style.display   = 'none';
 
  try {
    // Backend proxy orqali AI tahlil
    const response = await fetch(`${API_BASE}/analyze-image`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ image: base64, filename })
    });
 
    const result = await response.json();
    displayAIResult(result);
  } catch (err) {
    // Fallback simulatsiya
    const isReal      = Math.random() > 0.3;
    const confidence  = Math.floor(Math.random() * 25) + 75;
    displayAIResult({
      isTree: true, isReal, confidence,
      treeType: isReal ? 'Archa' : null,
      verdict:  isReal ? 'Qabul qilindi' : 'Rad etildi',
      reason:   isReal ? "Haqiqiy daraxt rasmi aniqlandi" : "Rasm tabiiy ko'rinmaydi",
      tags:     isReal
        ? ['Yashil barg', 'Katta hajm', 'Yaxshi holat', 'Tabiiy muhit']
        : ['Shubhali', 'Filtrlangan', 'Tabiiy emas']
    });
  }
 
  document.getElementById('ai-loading').style.display = 'none';
}
 
function displayAIResult(r) {
  const box    = document.getElementById('ai-result');
  const isGood = r.isReal && r.isTree;
  box.className    = 'ai-result ' + (isGood ? 'real' : 'fake');
  box.style.display = 'block';
 
  const titleEl = document.getElementById('ai-title');
  titleEl.className = 'ai-result-title ' + (isGood ? 'real' : 'fake');
  titleEl.innerHTML = (isGood ? '✅' : '❌') + ' ' + (r.verdict || "Noma'lum");
  document.getElementById('ai-desc').textContent = r.reason || '';
 
  const pct = r.confidence || 80;
  document.getElementById('ai-pct').textContent = pct + '%';
  const bar = document.getElementById('ai-bar');
  bar.className = 'confidence-fill ' + (isGood ? 'real' : 'fake');
  setTimeout(() => (bar.style.width = pct + '%'), 100);
 
  const tagsEl = document.getElementById('ai-tags');
  const tags   = r.tags || [];
  if (r.treeType)     tags.unshift('🌿 ' + r.treeType);
  if (r.estimatedAge) tags.push('⏳ '    + r.estimatedAge);
  tagsEl.innerHTML = tags.map(t => `<span class="ai-tag">${t}</span>`).join('');
}
 
// ====================== TOAST ======================
function showToast(title, sub) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-title').textContent = title;
  document.getElementById('toast-sub').textContent   = sub;
  toast.style.display = 'block';
  setTimeout(() => { toast.style.display = 'none'; }, 3500);
}
