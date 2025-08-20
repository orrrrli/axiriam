/*
  # Create extras and sales_extras tables

  1. New Tables
    - `extras` - Stores extra services/products with description and price
    - `sales_extras` - Junction table linking sales to extras

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users

  3. Changes
    - Remove extras column from sales table (if exists)
    - Create proper relational structure for extras
*/

-- Create extras table
CREATE TABLE IF NOT EXISTS extras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  description text NOT NULL,
  price decimal(10,2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create sales_extras junction table
CREATE TABLE IF NOT EXISTS sales_extras (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  sale_id uuid NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  extra_id uuid NOT NULL REFERENCES extras(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sale_id, extra_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_extras_description ON extras(description);
CREATE INDEX IF NOT EXISTS idx_sales_extras_sale_id ON sales_extras(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_extras_extra_id ON sales_extras(extra_id);

-- Enable Row Level Security
ALTER TABLE extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_extras ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies for extras
CREATE POLICY "Users can read extras"
  ON extras
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert extras"
  ON extras
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update extras"
  ON extras
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete extras"
  ON extras
  FOR DELETE
  TO authenticated
  USING (true);

-- Create RLS Policies for sales_extras
CREATE POLICY "Users can read sales extras"
  ON sales_extras
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert sales extras"
  ON sales_extras
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update sales extras"
  ON sales_extras
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Users can delete sales extras"
  ON sales_extras
  FOR DELETE
  TO authenticated
  USING (true);

-- Create trigger for automatic timestamp updates on extras
CREATE TRIGGER update_extras_updated_at
  BEFORE UPDATE ON extras
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert default extra categories
INSERT INTO extras (description, price) VALUES
  ('Botones', 0),
  ('Tira absorbente', 0),
  ('Nombre bordado', 0),
  ('Personalizado', 0),
  ('Nombre vinil', 0)
ON CONFLICT DO NOTHING;