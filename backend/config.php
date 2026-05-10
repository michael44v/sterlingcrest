<?php
/**
 * NorthBridge Bank - Configuration
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'northbridge_bank');
define('DB_USER', 'root');
define('DB_PASS', '');

// Security Configuration
define('JWT_SECRET', 'a_very_long_random_string_that_should_be_changed_in_production');
define('ALLOWED_ORIGIN', 'http://localhost:5173'); // Default Vite port

// SMTP Configuration (for EmailService)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_USER', 'support@northbridgebank.com');
define('SMTP_PASS', 'your_smtp_password');
define('SMTP_PORT', 465);

// Other constants
define('ROUTING_NUMBER', '123456789');
