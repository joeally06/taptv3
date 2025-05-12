/*
  # Fix Hall of Fame nominations RLS policies

  1. Changes
    - Drop existing INSERT policy that's not working correctly
    - Create new INSERT policy with proper permissions for public access
    - Ensure SELECT policy remains for admin access

  2. Security
    - Maintain RLS enabled on table
    - Allow public to create nominations without authentication
    - Keep admin-only read access
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow public to create nominations" ON public.hall_of_fame_nominations;

-- Create new INSERT policy with proper permissions
CREATE POLICY "Enable public nominations" ON public.hall_of_fame_nominations
FOR INSERT TO public
WITH CHECK (true);

-- Verify SELECT policy exists for admin access
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'hall_of_fame_nominations' 
    AND cmd = 'SELECT' 
    AND qual = '(role() = ''admin''::text)'
  ) THEN
    CREATE POLICY "Allow admin to read all nominations" ON public.hall_of_fame_nominations
    FOR SELECT TO public
    USING (role() = 'admin');
  END IF;
END $$;