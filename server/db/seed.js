import initSqlJs from 'sql.js'
import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const SQL = await initSqlJs()
const db = new SQL.Database()

console.log('🌱 Seeding ImpactIQ database...')

// Schema
db.run(`CREATE TABLE IF NOT EXISTS charities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL, category TEXT NOT NULL, emoji TEXT
);`)
// Note: schema.sql defines shopify_order_id TEXT UNIQUE — seed uses sql.js which doesn't
// enforce that constraint. INSERT OR IGNORE prevents duplicates on re-run.
db.run(`CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopify_order_id TEXT, created_at TEXT NOT NULL,
  total_price REAL NOT NULL, completed INTEGER NOT NULL DEFAULT 1,
  source TEXT NOT NULL DEFAULT 'web', customer_id TEXT
);`)
db.run(`CREATE TABLE IF NOT EXISTS order_charities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER, charity_id INTEGER, donation_amount REAL
);`)

// Charities
const charities = [
  ['Toronto Food Bank', 'Food Security', '🥫'],
  ['Ocean Wise', 'Environment', '🌊'],
  ['SickKids Foundation', 'Health', '🏥'],
  ['Tree Canada', 'Environment', '🌲'],
  ['Centre for Addiction & Mental Health', 'Health', '🧠'],
]
charities.forEach(([name, cat, emoji]) => {
  db.run('INSERT INTO charities (name, category, emoji) VALUES (?,?,?)', [name, cat, emoji])
})

const rand = (min, max) => Math.random() * (max - min) + min
const randInt = (min, max) => Math.floor(rand(min, max + 1))
const charityWeights = [0.342, 0.221, 0.187, 0.143, 0.107]

function weightedChoice(weights) {
  const r = Math.random(); let c = 0
  for (let i = 0; i < weights.length; i++) { c += weights[i]; if (r <= c) return i + 1 }
  return 1
}

function randomDate() {
  const d = new Date()
  d.setDate(d.getDate() - randInt(0, 90))
  d.setHours(randInt(6, 23), randInt(0, 59), 0, 0)
  return d.toISOString().replace('T', ' ').substring(0, 19)
}

function isWeekend(ds) { const day = new Date(ds).getDay(); return day === 0 || day === 6 }

function normalish(mean, std) {
  const u = 1 - Math.random(), v = Math.random()
  return Math.max(15, mean + Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v) * std)
}

const aovLifts = [0.635, 0.854, 0.351, 0.224, 0.424]
const BASELINE_AOV = 72.40
let charityCount = 0, abandonedCount = 0

for (let i = 0; i < 1380; i++) {
  const orderId = `ORD-${String(i + 1001).padStart(6, '0')}`
  const createdAt = randomDate()
  const weekend = isWeekend(createdAt)
  const source = Math.random() < 0.42 ? 'mobile' : (Math.random() < 0.08 ? 'pos' : 'web')
  const completed = Math.random() < (source === 'mobile' ? 0.78 : 0.88) ? 1 : 0
  if (!completed) abandonedCount++

  let charityProb = source === 'mobile' ? 0.381 : 0.674
  if (weekend) charityProb = Math.min(charityProb * 1.4, 0.92)
  if (source === 'pos') charityProb = 0.3
  const hasCharity = Math.random() < charityProb

  const charityId = hasCharity ? weightedChoice(charityWeights) : null
  const aov = hasCharity
    ? normalish(BASELINE_AOV * (1 + aovLifts[charityId - 1]), 32)
    : normalish(BASELINE_AOV, 28)
  const total = Math.round(aov * 100) / 100

  db.run('INSERT OR IGNORE INTO orders (shopify_order_id, created_at, total_price, completed, source, customer_id) VALUES (?,?,?,?,?,?)',
    [orderId, createdAt, total, completed, source, `CUST-${randInt(1, 850)}`])

  if (hasCharity && (completed === 1 || Math.random() < 0.85)) {
    charityCount++
    const donation = Math.random() < 0.4 ? Math.round(rand(1, 5) * 100) / 100 : Math.round(total * rand(0.01, 0.03) * 100) / 100
    const lastId = db.exec('SELECT last_insert_rowid() as id')[0].values[0][0]
    db.run('INSERT INTO order_charities (order_id, charity_id, donation_amount) VALUES (?,?,?)',
      [lastId, charityId, Math.max(0.50, donation)])
  }
}

// Save to disk
const data = db.export()
writeFileSync(join(__dirname, 'impactiq.db'), Buffer.from(data))

console.log(`✅ 1380 orders seeded (${charityCount} with charity, ${abandonedCount} abandoned)`)
console.log(`💾 Saved to ${join(__dirname, 'impactiq.db')}`)

// Verification
const stats = db.exec(`
  SELECT COUNT(*) as total, SUM(completed) as completed, AVG(total_price) as aov
  FROM orders
`)
console.log('📊 Stats:', stats[0].values[0])

const charityStats = db.exec(`
  SELECT c.name, COUNT(oc.id) as sel, ROUND(SUM(oc.donation_amount),0) as donated
  FROM charities c LEFT JOIN order_charities oc ON c.id = oc.charity_id
  GROUP BY c.id ORDER BY sel DESC
`)
console.log('🏆 Charities:')
charityStats[0].values.forEach(r => console.log(`   ${r[0]}: ${r[1]} selections, $${r[2]} donated`))
