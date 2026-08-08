-- Database migrations for profile picture, SWIFT/routing codes, and manual limits

ALTER TABLE users ADD COLUMN profile_picture_url LONGTEXT DEFAULT NULL;

ALTER TABLE accounts ADD COLUMN swift_code VARCHAR(100) DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN routing_code VARCHAR(100) DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN max_transfer_limit DECIMAL(15, 2) DEFAULT NULL;

-- Database migrations for custom user profile fields
ALTER TABLE users ADD COLUMN state VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN zipcode VARCHAR(20) DEFAULT NULL;
ALTER TABLE users ADD COLUMN account_type VARCHAR(50) DEFAULT 'Savings Account';
ALTER TABLE users ADD COLUMN occupation VARCHAR(100) DEFAULT NULL;
ALTER TABLE users ADD COLUMN date_of_birth DATE DEFAULT NULL;
ALTER TABLE users ADD COLUMN sex VARCHAR(20) DEFAULT NULL;

-- Ensure currency column is present in existing accounts tables
ALTER TABLE accounts ADD COLUMN currency VARCHAR(3) DEFAULT 'USD';
