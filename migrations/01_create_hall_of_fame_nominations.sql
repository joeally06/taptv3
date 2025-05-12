CREATE TABLE IF NOT EXISTS hall_of_fame_nominations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    supervisor_first_name VARCHAR(100) NOT NULL,
    supervisor_last_name VARCHAR(100) NOT NULL,
    district VARCHAR(200) NOT NULL,
    supervisor_email VARCHAR(255) NOT NULL,
    nominee_first_name VARCHAR(100) NOT NULL,
    nominee_last_name VARCHAR(100) NOT NULL,
    nominee_city VARCHAR(100) NOT NULL,
    nomination_reason TEXT NOT NULL,
    region VARCHAR(50) NOT NULL,
    is_tapt_member BOOLEAN NOT NULL,
    years_of_service INTEGER,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_hall_of_fame_nominations_updated_at
    BEFORE UPDATE ON hall_of_fame_nominations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();