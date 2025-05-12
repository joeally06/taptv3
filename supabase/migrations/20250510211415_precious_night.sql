/*
  # Remove Hall of Fame nominations table

  1. Changes
    - Drop the hall_of_fame_nominations table and all associated policies
*/

-- Drop the table (this will automatically drop associated policies and triggers)
DROP TABLE IF EXISTS hall_of_fame_nominations;