-- ImpactIQ Database Schema

CREATE TABLE IF NOT EXISTS charities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  emoji TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shopify_order_id TEXT UNIQUE,
  created_at DATETIME NOT NULL,
  total_price REAL NOT NULL,
  completed INTEGER NOT NULL DEFAULT 1,  -- 1 = completed, 0 = abandoned
  source TEXT NOT NULL DEFAULT 'web',    -- web, mobile, pos
  customer_id TEXT
);

CREATE TABLE IF NOT EXISTS order_charities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  charity_id INTEGER NOT NULL REFERENCES charities(id),
  donation_amount REAL NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for analytics queries
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_completed ON orders(completed);
CREATE INDEX IF NOT EXISTS idx_order_charities_charity ON order_charities(charity_id);
CREATE INDEX IF NOT EXISTS idx_order_charities_order ON order_charities(order_id);
-- Composite index covering all analytics WHERE clauses (shop_id, created_at, completed)
CREATE INDEX IF NOT EXISTS idx_orders_filters ON orders(shop_id, created_at, completed);
