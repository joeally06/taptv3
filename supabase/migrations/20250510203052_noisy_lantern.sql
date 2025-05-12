/*
  # Add district column to hall_of_fame_nominations table

  1. Changes
    - Add 'district' column to hall_of_fame_nominations table
    
  2. Description
    - Adds a new TEXT column to store the school district name
    - Column is required (NOT NULL)
*/

ALTER TABLE hall_of_fame_nominations
ADD COLUMN IF NOT EXISTS district TEXT NOT NULL;