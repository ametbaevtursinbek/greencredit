🌳 EcoCarbon Pro
Fayl Tuzilmasi
ecocarbon/
├── index.html     ← HTML sahifa (struktura)
├── style.css      ← Barcha CSS stillari
├── app.js         ← Frontend JavaScript logikasi
├── server.js      ← Node.js + Express backend
├── package.json   ← NPM konfiguratsiya
└── README.md      ← Ushbu fayl

Ishga Tushirish
1. Kerakli paketlarni o'rnatish
bashnpm install
2. Anthropic API kalitini sozlash (AI tahlil uchun)
bash# Linux / Mac
export ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx

# Windows CMD
set ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
3. Serverni ishga tushirish
bashnpm start
# yoki development rejimda:
npm run dev
4. Brauzerda ochish
http://localhost:3000

API Endpointlar
MethodURLTavsifPOST/api/auth/loginEmail/parol bilan kirishPOST/api/auth/registerYangi foydalanuvchi ro'yxatiGET/api/treesBarcha daraxtlar ro'yxatiPOST/api/treesYangi daraxt qo'shishDELETE/api/trees/:idDaraxt o'chirishGET/api/marketBozor ma'lumotlariPOST/api/market/buyKredit sotib olishPOST/api/analyze-imageAI rasm tahlili (Claude)GET/api/statsUmumiy statistika

Demo kirish

Email: demo@ecocarbon.uz
Parol: demo123


Production uchun tavsiyalar

In-memory database o'rniga PostgreSQL yoki MongoDB ishlating
JWT token bilan authentication qo'shing
HTTPS sozlang
.env fayl bilan API kalitlarni saqlang
