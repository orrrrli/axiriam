/*
  # Fix Materials RLS Policy

  1. Security Updates
    - Update RLS policies for materials table to ensure proper authentication handling
    - Add more permissive policies for development/testing if needed
    - Ensure policies work with current authentication state

  2. Changes
    - Review and update INSERT policy for materials
    - Ensure policies are consistent with application needs
*/

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Anyone can read materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can insert materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can update materials" ON materials;
DROP POLICY IF EXISTS "Authenticated users can delete materials" ON materials;

-- Recreate policies with proper conditions
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
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete materials"
  ON materials
  FOR DELETE
  TO authenticated
  USING (true);

-- Also ensure items policies are consistent
DROP POLICY IF EXISTS "Anyone can read items" ON items;
DROP POLICY IF EXISTS "Authenticated users can insert items" ON items;
DROP POLICY IF EXISTS "Authenticated users can update items" ON items;
DROP POLICY IF EXISTS "Authenticated users can delete items" ON items;

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
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete items"
  ON items
  FOR DELETE
  TO authenticated
  USING (true);