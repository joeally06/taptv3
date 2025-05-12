/*
  # Fix Hall of Fame nominations RLS policy

  1. Changes
    - Drop existing RLS policies
    - Create new policy allowing public nominations
    - Maintain admin-only read access

  2. Security
    - Enable RLS on table
    - Allow public nominations without authentication
    - Restrict read access to admin users
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Allow public to create nominations" ON hall_of_fame_nominations;
DROP POLICY IF EXISTS "Allow admin to read nominations" ON hall_of_fame_nominations;

-- Ensure RLS is enabled
ALTER TABLE hall_of_fame_nominations ENABLE ROW LEVEL SECURITY;

-- Allow anyone to create nominations without authentication
CREATE POLICY "Allow public to create nominations"
  ON hall_of_fame_nominations
  FOR INSERT
  TO public
  WITH CHECK (true);

-- Allow admin to read all nominations
CREATE POLICY "Allow admin to read nominations"
  ON hall_of_fame_nominations
  FOR SELECT
  TO authenticated
  USING ((auth.jwt() ->> 'role'::text) = 'admin'::text);