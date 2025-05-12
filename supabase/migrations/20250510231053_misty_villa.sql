/*
  # Reset admin password
  
  Updates the password for the admin user account
*/

-- Update admin user password
UPDATE public.users 
SET 
  password = crypt('27Ja@1396!@', gen_salt('bf')),
  updated_at = now()
WHERE email = 'admin@tapt.org';