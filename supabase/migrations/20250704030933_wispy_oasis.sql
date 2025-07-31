/*
  # Complete Inventory Management Database Schema

  1. New Tables
    - `raw_materials` - Stores fabric/material designs with images and specifications
    - `items` - Stores finished products (gorros) with categories and pricing
    - `order_materials` - Stores material orders with complex design specifications
    - `order_material_groups` - Groups of materials within an order
    - `order_designs` - Individual design specifications for each material group
    - `sales` - Stores sales transactions with shipping and social media info
    - `sale_items` - Junction table for items sold in each sale

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Proper foreign key constraints and indexes

  3. Features
    - Support for image storage (base64 or URLs)
    - Complex order structure with multiple materials and designs
    - Comprehensive sales tracking with shipping options
    - Audit trails with created_at and updated_at timestamps
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Raw Materials Table
CREATE TABLE IF NOT EXISTS raw_materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text DEFAULT '',
  width decimal(10,3) NOT NULL CHECK (width > 0),
  height decimal(10,3) NOT NULL CHECK (height > 0),
  quantity decimal(10,3) NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  unit text NOT NULL DEFAULT 'm²' CHECK (unit IN ('m²', 'metros', 'piezas', 'rollos')),
  price decimal(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  supplier text DEFAULT '',
  image_url text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Items Table (Gorros)
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('sencillo', 'doble-vista', 'completo'),
  type text NOT NULL CHECK (type IN ('sencillo-algodon', 'completo-algodon', 'stretch')),
  description text DEFAULT '',
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  price decimal(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Item Materials Junction Table
CREATE TABLE IF NOT EXISTS item_materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  raw_material_id uuid NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_id, raw_material_id)
);

-- Order Materials Table
CREATE TABLE IF NOT EXISTS order_materials (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  distributor text NOT NULL,
  description text DEFAULT '',
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received')),
  tracking_number text DEFAULT '',
  estimated_delivery timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Order Material Groups Table
CREATE TABLE IF NOT EXISTS order_material_groups (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_material_id uuid NOT NULL REFERENCES order_materials(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Order Designs Table
CREATE TABLE IF NOT EXISTS order_designs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_material_group_id uuid NOT NULL REFERENCES order_material_groups(id) ON DELETE CASCADE,
  raw_material_id uuid NOT NULL REFERENCES raw_materials(id) ON DELETE CASCADE,
  height decimal(10,3) NOT NULL CHECK (height > 0),
  width decimal(10,3) NOT NULL CHECK (width > 0),
  created_at timestamptz DEFAULT now()
);

-- Sales Table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'shipped', 'delivered')),
  social_media_platform text NOT NULL CHECK (social_media_platform IN ('facebook', 'instagram', 'whatsapp')),
  social_media_username text NOT NULL,
  tracking_number text DEFAULT '',
  invoice_required boolean DEFAULT false,
  shipping_type text NOT NULL CHECK (shipping_type IN ('local', 'nacional')),
  local_shipping_option text CHECK (local_shipping_option IN ('meeting-point', 'pzexpress')),
  local_address text DEFAULT '',
  national_shipping_carrier text CHECK (national_shipping_carrier IN ('estafeta', 'dhl', 'fedex', 'correos')),
  shipping_description text DEFAULT '',
  total_amount decimal(10,2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Sale Items Junction Table
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity > 0),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_raw_materials_name ON raw_materials(name);
CREATE INDEX IF NOT EXISTS idx_raw_materials_supplier ON raw_materials(supplier);
CREATE INDEX IF NOT EXISTS idx_raw_materials_quantity ON raw_materials(quantity);

CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_items_quantity ON items(quantity);

CREATE INDEX IF NOT EXISTS idx_item_materials_item_id ON item_materials(item_id);
CREATE INDEX IF NOT EXISTS idx_item_materials_raw_material_id ON item_materials(raw_material_id);

CREATE INDEX IF NOT EXISTS idx_order_materials_status ON order_materials(status);
CREATE INDEX IF NOT EXISTS idx_order_materials_distributor ON order_materials(distributor);
CREATE INDEX IF NOT EXISTS idx_order_materials_created_at ON order_materials(created_at);

CREATE INDEX IF NOT EXISTS idx_order_material_groups_order_id ON order_material_groups(order_material_id);
CREATE INDEX IF NOT EXISTS idx_order_designs_group_id ON order_designs(order_material_group_id);
CREATE INDEX IF NOT EXISTS idx_order_designs_raw_material_id ON order_designs(raw_material_id);

CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);
CREATE INDEX IF NOT EXISTS idx_sales_sale_id ON sales(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_name ON sales(name);
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);

CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_item_id ON sale_items(item_id);

-- Enable Row Level Security
ALTER TABLE raw_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_material_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for Raw Materials
CREATE POLICY "Users can read raw materials"
  ON raw_materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert raw materials"
  ON raw_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update raw materials"
  ON raw_materials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete raw materials"
  ON raw_materials
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Items
CREATE POLICY "Users can read items"
  ON items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete items"
  ON items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Item Materials
CREATE POLICY "Users can read item materials"
  ON item_materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert item materials"
  ON item_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update item materials"
  ON item_materials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete item materials"
  ON item_materials
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Order Materials
CREATE POLICY "Users can read order materials"
  ON order_materials
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert order materials"
  ON order_materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update order materials"
  ON order_materials
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete order materials"
  ON order_materials
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Order Material Groups
CREATE POLICY "Users can read order material groups"
  ON order_material_groups
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert order material groups"
  ON order_material_groups
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update order material groups"
  ON order_material_groups
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete order material groups"
  ON order_material_groups
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Order Designs
CREATE POLICY "Users can read order designs"
  ON order_designs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert order designs"
  ON order_designs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update order designs"
  ON order_designs
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete order designs"
  ON order_designs
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Sales
CREATE POLICY "Users can read sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for Sale Items
CREATE POLICY "Users can read sale items"
  ON sale_items
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sale items"
  ON sale_items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sale items"
  ON sale_items
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sale items"
  ON sale_items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_raw_materials_updated_at
  BEFORE UPDATE ON raw_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_materials_updated_at
  BEFORE UPDATE ON order_materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to generate sale IDs
CREATE OR REPLACE FUNCTION generate_sale_id()
RETURNS text AS $$
DECLARE
  year_part text;
  random_part text;
BEGIN
  year_part := EXTRACT(YEAR FROM now())::text;
  random_part := LPAD((RANDOM() * 999)::int::text, 3, '0');
  RETURN 'SALE-' || year_part || '-' || random_part;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate sale IDs
CREATE OR REPLACE FUNCTION set_sale_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sale_id IS NULL OR NEW.sale_id = '' THEN
    NEW.sale_id := generate_sale_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_sales_sale_id
  BEFORE INSERT ON sales
  FOR EACH ROW
  EXECUTE FUNCTION set_sale_id();