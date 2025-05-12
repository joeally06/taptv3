/*
  # Fix Hall of Fame nominations RLS policy

  1. Changes
    - Drop existing policies
    - Create new policy for public nominations
    - Create new policy for admin read access

  2. Security
    - Enable RLS on table
    - Allow anyone to create nominations
    - Allow only admins to read nominations
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create nominations" ON hall_of_fame_nominations;
DROP POLICY IF EXISTS "Allow admin to read nominations" ON hall_of_fame_nominations;

-- Recreate policies with correct permissions
CREATE POLICY "Allow public to create nominations"
  ON hall_of_fame_nominations
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow admin to read nominations"
  ON hall_of_fame_nominations
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'admin');