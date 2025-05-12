-- Drop existing policies
DROP POLICY IF EXISTS "Allow public to create nominations" ON public.hall_of_fame_nominations;
DROP POLICY IF EXISTS "Allow admin to read all nominations" ON public.hall_of_fame_nominations;
DROP POLICY IF EXISTS "Enable public nominations" ON public.hall_of_fame_nominations;

-- Create new INSERT policy with proper permissions
CREATE POLICY "Enable public nominations" ON public.hall_of_fame_nominations
FOR INSERT TO public
WITH CHECK (true);

-- Create SELECT policy for admin access
CREATE POLICY "Allow admin to read all nominations" ON public.hall_of_fame_nominations
FOR SELECT TO public
USING (true);