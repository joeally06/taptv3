/*
  # Update Hall of Fame nominations policies

  1. Changes
    - Drop and recreate INSERT policy for public nominations
    - Drop and recreate SELECT policy for admin access

  2. Security
    - Maintains RLS enabled
    - Updates policies to use auth.role() for admin checks
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create nominations" ON public.hall_of_fame_nominations;
DROP POLICY IF EXISTS "Allow admin to read all nominations" ON public.hall_of_fame_nominations;

-- Create new INSERT policy with proper permissions
CREATE POLICY "Enable public nominations" ON public.hall_of_fame_nominations
FOR INSERT TO public
WITH CHECK (true);

-- Create SELECT policy for admin access using auth.role()
CREATE POLICY "Allow admin to read all nominations" ON public.hall_of_fame_nominations
FOR SELECT TO public
USING (auth.role() = 'admin');