
Copy

/* ============================
   EcoCarbon Pro — server.js
   Node.js + Express Backend
   ============================ */
 
const express = require('express');
const cors    = require('cors');
const crypto  = require('crypto');
 
const app  = express();
const PORT = process.env.PORT || 3000;
 
// Anthropic API kaliti — .env fayldan yoki muhit o'zgaruvchisidan
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
 
// ---- Middleware ----
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '20mb' }));       // Rasm yuklamalar uchun katta limit
app.use(express.static('.')); // index.html, style.css, app.js ni serve qiladi
 
// ---- In-memory "database" (ishlab chiqishda) ----
// Production'da PostgreSQL / MongoDB ishlatiladi
let users = [
  { id: 'usr_demo', name: 'Demo User', email: 'demo@ecocarbon.uz', passwordHash: hashPassword('demo123') }
];
 
let trees = [
  { id: 'A1B2C3', turi: 'Chinor', yoshi: 10, lat: 41.3111, lon: 69.2405, kredit: 0.45,  daromad: 29.25, owner: 'demo@ecocarbon.uz', height: 8.0,  createdAt: new Date() },
  { id: 'D4E5F6', turi: 'Archa',  yoshi: 5,  lat: 41.3200, lon: 69.2500, kredit: 0.11,  daromad: 7.15,  owner: 'demo@ecocarbon.uz', height: 3.5,  createdAt: new Date() }
];
 
let purchases = [];
 
// ---- Helper: parol hashlash ----
function hashPassword(password) {
  return crypto.createHash('sha256').update(password + 'ecocarbon_salt').digest('hex');
}
 
// ====================== AUTH ROUTES ======================
 
// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
 
  if (!email || !password) {
    return res.status(400).json({ error: 'Email va parol kiritish shart.' });
  }
 
  const user = users.find(u => u.email === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ error: "Foydalanuvchi topilmadi." });
  }
 
  if (user.passwordHash !== hashPassword(password)) {
    return res.status(401).json({ error: "Parol noto'g'ri." });
  }
 
  res.json({
    success: true,
    user:    { id: user.id, name: user.name, email: user.email, provider: 'email' }
  });
});
 
// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body;
 
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Barcha maydonlarni to'ldiring." });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: "Parol kamida 6 ta belgi bo'lishi kerak." });
  }
  if (!email.includes('@')) {
    return res.status(400).json({ error: "Email manzil noto'g'ri." });
  }
 
  const exists = users.find(u => u.email === email.toLowerCase().trim());
  if (exists) {
    return res.status(409).json({ error: 'Bu email allaqachon ro\'yxatdan o\'tgan.' });
  }
 
  const newUser = {
    id:           'usr_' + crypto.randomBytes(4).toString('hex'),
    name:         name.trim(),
    email:        email.toLowerCase().trim(),
    passwordHash: hashPassword(password)
  };
  users.push(newUser);
 
  res.status(201).json({
    success: true,
    user:    { id: newUser.id, name: newUser.name, email: newUser.email, provider: 'email' }
  });
});
 
// ====================== TREES ROUTES ======================
 
// GET /api/trees  — barcha daraxtlar ro'yxati
app.get('/api/trees', (req, res) => {
  const { owner } = req.query;
  const result    = owner ? trees.filter(t => t.owner === owner) : trees;
  res.json(result);
});
 
// GET /api/trees/:id  — bitta daraxt
app.get('/api/trees/:id', (req, res) => {
  const tree = trees.find(t => t.id === req.params.id);
  if (!tree) return res.status(404).json({ error: 'Daraxt topilmadi.' });
  res.json(tree);
});
 
// POST /api/trees  — yangi daraxt qo'shish
app.post('/api/trees', (req, res) => {
  const { turi, yoshi, lat, lon, kredit, daromad, height, owner } = req.body;
 
  if (!turi || !yoshi || lat === undefined || lon === undefined) {
    return res.status(400).json({ error: "Majburiy maydonlar: turi, yoshi, lat, lon." });
  }
 
  const newTree = {
    id:        req.body.id || crypto.randomBytes(3).toString('hex').toUpperCase(),
    turi, yoshi, lat, lon,
    kredit:    kredit    || 0,
    daromad:   daromad   || 0,
    height:    height    || 3.0,
    owner:     owner     || 'anonymous',
    status:    'verified',
    createdAt: new Date()
  };
  trees.push(newTree);
 
  res.status(201).json({ success: true, tree: newTree });
});
 
// DELETE /api/trees/:id  — daraxt o'chirish
app.delete('/api/trees/:id', (req, res) => {
  const idx = trees.findIndex(t => t.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Daraxt topilmadi.' });
  trees.splice(idx, 1);
  res.json({ success: true });
});
 
// ====================== MARKETPLACE ROUTES ======================
 
// GET /api/market  — bozor ma'lumotlari
app.get('/api/market', (req, res) => {
  const marketData = [
    { id: 'MKT001', turi: 'Chinor', yoshi: 15, kredit: 0.675, daromad: 43.88, owner: 'Karimov F.',   city: 'Toshkent' },
    { id: 'MKT002', turi: 'Archa',  yoshi: 8,  kredit: 0.176, daromad: 11.44, owner: 'Rahimova M.',  city: 'Chirchiq'  },
    { id: 'MKT003', turi: 'Terak',  yoshi: 12, kredit: 0.36,  daromad: 23.40, owner: 'Umarov B.',    city: 'Toshkent'  },
    { id: 'MKT004', turi: 'Mevali', yoshi: 7,  kredit: 0.105, daromad: 6.83,  owner: 'Nazarova D.',  city: 'Angren'    },
    { id: 'MKT005', turi: 'Chinor', yoshi: 20, kredit: 0.90,  daromad: 58.50, owner: 'Xasanov A.',   city: 'Toshkent'  },
    { id: 'MKT006', turi: 'Archa',  yoshi: 3,  kredit: 0.066, daromad: 4.29,  owner: 'Toshmatov S.', city: 'Olmaliq'   }
  ];
  res.json(marketData);
});
 
// POST /api/market/buy  — kredit sotib olish
app.post('/api/market/buy', (req, res) => {
  const { id, buyer, price } = req.body;
 
  if (!id || !buyer) {
    return res.status(400).json({ error: 'id va buyer majburiy.' });
  }
 
  const purchase = {
    purchaseId: 'PUR_' + crypto.randomBytes(4).toString('hex').toUpperCase(),
    creditId:   id,
    buyer,
    price:      price || 0,
    purchasedAt: new Date()
  };
  purchases.push(purchase);
 
  res.status(201).json({ success: true, purchase });
});
 
// ====================== AI IMAGE ANALYSIS ======================
 
// POST /api/analyze-image  — Anthropic Claude orqali rasm tahlili
app.post('/api/analyze-image', async (req, res) => {
  const { image, filename } = req.body;
 
  if (!image) {
    return res.status(400).json({ error: 'Rasm ma\'lumoti kerak.' });
  }
 
  if (!ANTHROPIC_API_KEY) {
    // API kaliti yo'q — simulatsiya qaytariladi
    return res.json(simulateAIResult());
  }
 
  try {
    const base64Data = image.split(',')[1];
    const mediaType  = image.split(';')[0].split(':')[1] || 'image/jpeg';
 
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method:  'POST',
      headers: {
        'Content-Type':      'application/json',
        'x-api-key':         ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model:      'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: [
            {
              type:   'image',
              source: { type: 'base64', media_type: mediaType, data: base64Data }
            },
            {
              type: 'text',
              text: `Siz karbon kredit platformasi uchun AI analizatorsiz. Ushbu rasmni tekshiring va quyidagi JSON formatda javob bering (faqat JSON, boshqa narsa yozmang):
{
  "isTree": true yoki false (rasmda daraxt bormi),
  "isReal": true yoki false (rasm haqiqiy fotografiyami yoki AI/montaj),
  "confidence": 0-100 (ishonchlilik foizi),
  "treeType": "daraxt turi yoki null",
  "estimatedAge": "taxminiy yosh yoki null",
  "issues": ["muammolar ro'yxati yoki bo'sh massiv"],
  "tags": ["3-5 ta tavsiflovchi kalit so'zlar"],
  "verdict": "Qabul qilindi yoki Rad etildi",
  "reason": "Qisqacha sabab (uzbekcha)"
}`
            }
          ]
        }]
      })
    });
 
    const data   = await response.json();
    const text   = data.content.map(i => i.text || '').join('');
    const clean  = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.json(result);
  } catch (err) {
    console.error('AI tahlil xatosi:', err.message);
    res.json(simulateAIResult());
  }
});
 
function simulateAIResult() {
  const isReal     = Math.random() > 0.3;
  const confidence = Math.floor(Math.random() * 25) + 75;
  return {
    isTree:    true,
    isReal,
    confidence,
    treeType:  isReal ? 'Archa' : null,
    verdict:   isReal ? 'Qabul qilindi' : 'Rad etildi',
    reason:    isReal ? "Haqiqiy daraxt rasmi aniqlandi" : "Rasm tabiiy ko'rinmaydi",
    tags:      isReal
      ? ['Yashil barg', 'Katta hajm', 'Yaxshi holat', 'Tabiiy muhit']
      : ['Shubhali', 'Filtrlangan', 'Tabiiy emas']
  };
}
 
// ====================== STATS ROUTE ======================
 
// GET /api/stats  — umumiy statistika
app.get('/api/stats', (req, res) => {
  const totalTrees   = trees.length;
  const totalCredits = trees.reduce((s, t) => s + (t.kredit  || 0), 0);
  const totalIncome  = trees.reduce((s, t) => s + (t.daromad || 0), 0);
  res.json({ totalTrees, totalCredits: +totalCredits.toFixed(3), totalIncome: +totalIncome.toFixed(2) });
});
 
// ====================== SERVER START ======================
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║   🌳 EcoCarbon Pro Backend           ║
║   http://localhost:${PORT}              ║
╚══════════════════════════════════════╝
 
API Endpoints:
  POST   /api/auth/login
  POST   /api/auth/register
  GET    /api/trees
  POST   /api/trees
  DELETE /api/trees/:id
  GET    /api/market
  POST   /api/market/buy
  POST   /api/analyze-image
  GET    /api/stats
 
ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY ? '✅ Set' : '⚠️  Not set (AI simulation mode)'}
  `);
});
 
module.exports = app;
 
