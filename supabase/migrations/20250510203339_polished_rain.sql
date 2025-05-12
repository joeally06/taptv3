/*
  # Add district column to hall_of_fame_nominations table

  1. Changes
    - Adds district column to hall_of_fame_nominations table if it doesn't exist
    - Ensures column is NOT NULL
*/

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