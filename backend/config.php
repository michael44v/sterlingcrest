<?php
/**
 * NorthBridge Bank - Configuration
 */

// Database Configuration
define('DB_HOST', 'localhost');
define('DB_NAME', 'northbridge_bank');
define('DB_USER', 'root_north');
define('DB_PASS', 'victor47009A?');

// Security Configuration
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'dev_secret_only');
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'http://localhost:5173'); // Default Vite port

// SMTP Configuration (for EmailService)
define('SMTP_HOST', 'smtp.hostinger.com');
define('SMTP_USER', 'support@northbridgebank.com');
define('SMTP_PASS', 'your_smtp_password');
define('SMTP_PORT', 465);

// Other constants
define('ROUTING_NUMBER', '123456789');
