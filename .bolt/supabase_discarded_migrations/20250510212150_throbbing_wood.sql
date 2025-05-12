/*
  # Fix Hall of Fame nominations RLS policies

  1. Changes
    - Drop existing INSERT policy
    - Create new INSERT policy for public nominations
    - Create SELECT policy for admin access using auth.uid()

  2. Security
    - Enable public submissions without authentication
    - Restrict viewing nominations to authenticated admin users
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Allow public to create nominations" ON public.hall_of_fame_nominations;

-- Create new INSERT policy with proper permissions
CREATE POLICY "Enable public nominations" ON public.hall_of_fame_nominations
FOR INSERT TO public
WITH CHECK (true);

-- Create SELECT policy for admin access using auth.uid()
CREATE POLICY "Allow admin to read all nominations" ON public.hall_of_fame_nominations
FOR SELECT TO public
USING (auth.role() = 'admin');