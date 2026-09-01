-- Shipping Fee Model Configuration
-- Stores the selected shipping fee model (per_item, per_order_flat, or multi_item_discount)
-- and related configuration for a shop
CREATE TABLE shipping_fee_models (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Type of shipping model: 'per_item' | 'per_order_flat' | 'multi_item_discount'
  model VARCHAR(50) NOT NULL CHECK (model IN ('per_item', 'per_order_flat', 'multi_item_discount')),
  
  -- Base shipping fee in naira for the first item
  base_fee INTEGER NOT NULL DEFAULT 1000 CHECK (base_fee > 0),
  
  -- Discount percentage for additional items (only used for multi_item_discount model)
  discount_percent INTEGER NOT NULL DEFAULT 50 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one shipping model per shop
  UNIQUE(shop_id)
);

CREATE INDEX idx_shipping_fee_models_shop_id ON shipping_fee_models(shop_id);


-- Shipping Zones
-- Stores shipping zones with their locations, fees, and discount configurations
-- Related to ShippingZonesScreen and ShippingZoneEditScreen
CREATE TABLE shipping_zones (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Zone identifier (unique per shop)
  zone_id VARCHAR(255) NOT NULL,
  
  -- Geo-political zone name
  name VARCHAR(255) NOT NULL,
  
  -- Locations covered by this zone (array of Nigerian states/cities)
  locations TEXT[] NOT NULL,
  
  -- Base shipping fee for the first item in this zone
  base_fee INTEGER NOT NULL DEFAULT 1000 CHECK (base_fee > 0),
  
  -- Discount percentage for additional items in this zone
  discount_percent INTEGER NOT NULL DEFAULT 50 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  
  -- Pin color for UI display (hex color code)
  pin_color VARCHAR(7) NOT NULL DEFAULT '#0D4F3C',
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Unique constraint: zone_id is unique per shop
  UNIQUE(shop_id, zone_id)
);

CREATE INDEX idx_shipping_zones_shop_id ON shipping_zones(shop_id);
CREATE INDEX idx_shipping_zones_zone_id ON shipping_zones(zone_id);


-- Multi-Item Discount Configuration
-- Stores the multi-item discount model configuration separately for clarity
-- This is the configuration from ShippingMultiItemDiscountScreen
CREATE TABLE shipping_multi_item_discounts (
  id SERIAL PRIMARY KEY,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  
  -- Base fee for first item
  base_fee INTEGER NOT NULL DEFAULT 1000 CHECK (base_fee > 0),
  
  -- Discount percentage for items beyond the first
  discount_percent INTEGER NOT NULL DEFAULT 50 CHECK (discount_percent >= 0 AND discount_percent <= 100),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure only one multi-item discount configuration per shop
  UNIQUE(shop_id)
);

CREATE INDEX idx_shipping_multi_item_discounts_shop_id ON shipping_multi_item_discounts(shop_id);
