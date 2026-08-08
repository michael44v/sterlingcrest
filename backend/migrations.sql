-- Database migrations for profile picture, SWIFT/routing codes, and manual limits

ALTER TABLE users ADD COLUMN profile_picture_url LONGTEXT DEFAULT NULL;

ALTER TABLE accounts ADD COLUMN swift_code VARCHAR(100) DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN routing_code VARCHAR(100) DEFAULT NULL;
ALTER TABLE accounts ADD COLUMN max_transfer_limit DECIMAL(15, 2) DEFAULT NULL;
