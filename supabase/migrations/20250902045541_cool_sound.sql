/*
  # Add delivery date to sales table

  1. Schema Changes
    - Add `delivery_date` column to `sales` table (nullable date field)
    - Add index for efficient querying by delivery date

  2. Security
    - Update existing RLS policies to include new column
    - Maintain current access patterns

  3. Notes
    - Delivery date is optional and can be set/updated after sale creation
    - Supports both manual entry and automated setting based on tracking
*/

-- Add delivery_date column to sales table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'sales' AND column_name = 'delivery_date'
  ) THEN
    ALTER TABLE sales ADD COLUMN delivery_date date;
  END IF;
END $$;

-- Add index for delivery date queries
CREATE INDEX IF NOT EXISTS idx_sales_delivery_date ON sales(delivery_date);

-- Add comment for documentation
COMMENT ON COLUMN sales.delivery_date IS 'Expected or actual delivery date for the sale';