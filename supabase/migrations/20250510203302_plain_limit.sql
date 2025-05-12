/*
  # Add district field to hall_of_fame_nominations table

  1. Changes
    - Add district column to hall_of_fame_nominations table
    - Drop existing policies
    - Recreate policies with updated conditions

  2. Security
    - Maintain RLS enabled
    - Allow authenticated users to create nominations
    - Allow admin users to read nominations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create nominations" ON hall_of_fame_nominations;
DROP POLICY IF EXISTS "Allow admin to read nominations" ON hall_of_fame_nominations;

-- Add district column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hall_of_fame_nominations'
    AND column_name = 'district'
  ) THEN
    ALTER TABLE hall_of_fame_nominations ADD COLUMN district text NOT NULL;
  END IF;
END $$;

-- Recreate policies
CREATE POLICY "Allow public to create nominations"
  ON hall_of_fame_nominations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin to read nominations"
  ON hall_of_fame_nominations
  FOR SELECT
  TO authenticated
  USING (auth.role() = 'admin');