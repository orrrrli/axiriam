/*
  # Inventory Management Database Schema

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `materials`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `quantity` (integer)
      - `unit` (text)
      - `price` (decimal)
      - `supplier` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `items`
      - `id` (uuid, primary key)
      - `name` (text)
      - `category` (text)
      - `description` (text)
      - `quantity` (integer)
      - `price` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `users_items` (junction table)
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `item_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `items_materials` (junction table)
      - `id` (uuid, primary key)
      - `item_id` (uuid, foreign key)
      - `material_id` (uuid, foreign key)
      - `quantity_used` (decimal, optional)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their data
    - Public read access for materials and items (adjust as needed)

  3. Indexes
    - Add indexes for frequently queried columns
    - Foreign key indexes for better join performance
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create materials table
CREATE TABLE IF NOT EXISTS materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'm²',
  price decimal(10,2) NOT NULL DEFAULT 0,
  supplier text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create items table
CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL CHECK (category IN ('sencillo', 'doble-vista', 'completo-ajustable')),
  description text DEFAULT '',
  quantity integer NOT NULL DEFAULT 0,
  price decimal(10,2) NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create users_items junction table
CREATE TABLE IF NOT EXISTS users_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, item_id)
);

-- Create items_materials junction table
CREATE TABLE IF NOT EXISTS items_materials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  material_id uuid NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  quantity_used decimal(10,2) DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  UNIQUE(item_id, material_id)
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_materials ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for materials table (public read, authenticated write)
CREATE POLICY "Anyone can read materials"
  ON materials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert materials"
  ON materials
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update materials"
  ON materials
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete materials"
  ON materials
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for items table (public read, authenticated write)
CREATE POLICY "Anyone can read items"
  ON items
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert items"
  ON items
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update items"
  ON items
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can delete items"
  ON items
  FOR DELETE
  TO authenticated
  USING (true);

-- Create policies for users_items junction table
CREATE POLICY "Users can read own item associations"
  ON users_items
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own item associations"
  ON users_items
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own item associations"
  ON users_items
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for items_materials junction table
CREATE POLICY "Anyone can read item-material associations"
  ON items_materials
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Authenticated users can manage item-material associations"
  ON items_materials
  FOR ALL
  TO authenticated
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_materials_name ON materials(name);
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category);
CREATE INDEX IF NOT EXISTS idx_users_items_user_id ON users_items(user_id);
CREATE INDEX IF NOT EXISTS idx_users_items_item_id ON users_items(item_id);
CREATE INDEX IF NOT EXISTS idx_items_materials_item_id ON items_materials(item_id);
CREATE INDEX IF NOT EXISTS idx_items_materials_material_id ON items_materials(material_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at
  BEFORE UPDATE ON materials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();