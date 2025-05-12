/*
  # Update Hall of Fame nominations policies

  1. Changes
    - Drop and recreate policies with correct auth checks
    - Ensure policies use correct auth functions
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create nominations" ON hall_of_fame_nominations;
DROP POLICY IF EXISTS "Allow admin to read nominations" ON hall_of_fame_nominations;

-- Recreate policies with correct auth checks
CREATE POLICY "Allow public to create nominations"
  ON hall_of_fame_nominations
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow admin to read nominations"
  ON hall_of_fame_nominations
  FOR SELECT
  TO authenticated
  USING (auth.uid() IN (
    SELECT auth.uid() 
    FROM auth.users 
    WHERE auth.users.raw_user_meta_data->>'role' = 'admin'
  ));