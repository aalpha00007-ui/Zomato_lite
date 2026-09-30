-- zomato-lite schema v2. Facts only.
-- Still no average_rating column, no order total column, no order status column.
-- Averages, bills and delivery status are answers: the backend computes them on every request.

CREATE TABLE cities (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

CREATE TABLE restaurants (
  id SERIAL PRIMARY KEY,
  city_id INTEGER NOT NULL REFERENCES cities(id),
  name TEXT NOT NULL,
  cuisine TEXT NOT NULL,
  area TEXT NOT NULL,
  cost_for_two INTEGER NOT NULL,
  delivery_minutes INTEGER NOT NULL,
  pure_veg BOOLEAN NOT NULL DEFAULT FALSE,
  emoji TEXT NOT NULL,
  tint TEXT NOT NULL,
  offer TEXT
);

CREATE TABLE menu_items (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price > 0),
  veg BOOLEAN NOT NULL,
  bestseller BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE sessions (
  token TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE addresses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  label TEXT NOT NULL,
  line TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  user_id INTEGER REFERENCES users(id),
  author TEXT NOT NULL DEFAULT 'Guest',
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE cart_items (
  user_id INTEGER NOT NULL REFERENCES users(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  qty INTEGER NOT NULL CHECK (qty BETWEEN 1 AND 20),
  PRIMARY KEY (user_id, menu_item_id)
);

-- An order stores what was charged at the time (fees can change later - what you paid can't).
-- Item total and grand total are still computed from order_items.
CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  restaurant_id INTEGER NOT NULL REFERENCES restaurants(id),
  address_label TEXT NOT NULL,
  address_line TEXT NOT NULL,
  payment_method TEXT NOT NULL,
  delivery_fee INTEGER NOT NULL,
  platform_fee INTEGER NOT NULL,
  gst INTEGER NOT NULL,
  placed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Name and price are copied at order time: if the menu price changes tomorrow, your old bill must not.
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders(id),
  menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
  name TEXT NOT NULL,
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
