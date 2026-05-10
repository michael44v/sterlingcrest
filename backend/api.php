<?php
/**
 * NorthBridge Bank - API Entry Point
 * Stack: PHP REST API
 * Version: 1.0
 */

// Error Handling
set_exception_handler(function($e) {
    json_response("error", $e->getMessage());
});

// CORS headers
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Load configurations
require_once 'config.php';
require_once 'Security.php';
require_once 'EmailService.php';

// Database Singleton
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        try {
            $this->conn = new PDO("mysql:host=" . DB_HOST . ";dbname=" . DB_NAME, DB_USER, DB_PASS);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $e) {
            throw new Exception("Database Connection Error: " . $e->getMessage());
        }
    }

    public static function getInstance() {
        if (!self::$instance) {
            self::$instance = new Database();
        }
        return self::$instance;
    }

    public function getConnection() {
        return $this->conn;
    }
}

// Response Helper
function json_response($status, $message, $data = []) {
    echo json_encode([
        "status" => $status,
        "message" => $message,
        "data" => $data
    ]);
    exit;
}

// Auth Middleware
function require_auth() {
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';

    if (preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
        $token = $matches[1];
        try {
            $decoded = Security::validateAccessToken($token);
            return $decoded;
        } catch (Exception $e) {
            header('HTTP/1.0 401 Unauthorized');
            json_response("error", "Unauthorized: " . $e->getMessage());
        }
    } else {
        header('HTTP/1.0 401 Unauthorized');
        json_response("error", "Unauthorized: No token provided");
    }
}

// Routing logic
$action = $_GET['action'] ?? '';

switch ($action) {
    // Auth Endpoints (No Auth Required)
    case 'register':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['full_name']) || empty($data['email']) || empty($data['phone']) || empty($data['password'])) {
            json_response("error", "Missing required fields");
        }

        $db = Database::getInstance()->getConnection();

        // Check if user already exists
        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
        $stmt->execute([$data['email'], $data['phone']]);
        if ($stmt->fetch()) {
            json_response("error", "User with this email or phone already exists");
        }

        $password_hash = Security::hashData($data['password']);

        $db->beginTransaction();
        try {
            // Create user
            $stmt = $db->prepare("INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)");
            $stmt->execute([$data['full_name'], $data['email'], $data['phone'], $password_hash]);
            $user_id = $db->lastInsertId();

            // Create account
            $account_number = str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
            $stmt = $db->prepare("INSERT INTO accounts (user_id, account_number) VALUES (?, ?)");
            $stmt->execute([$user_id, $account_number]);

            // Generate OTP
            $otp = Security::generateOTP();
            $stmt = $db->prepare("INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, 'registration', ?)");
            $stmt->execute([$user_id, $otp, date('Y-m-d H:i:s', time() + 600)]);

            EmailService::sendOTPEmail($data['email'], $data['full_name'], $otp, 'registration');

            $db->commit();
            json_response("success", "Registration successful. Please verify your email.", ["user_id" => $user_id]);
        } catch (Exception $e) {
            $db->rollBack();
            json_response("error", "Registration failed: " . $e->getMessage());
        }
        break;

    case 'verify_email':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['user_id']) || empty($data['otp'])) {
            json_response("error", "Missing required fields");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id FROM otp_codes WHERE user_id = ? AND code = ? AND type = 'registration' AND used_at IS NULL AND expires_at > NOW()");
        $stmt->execute([$data['user_id'], $data['otp']]);
        $otp_record = $stmt->fetch();

        if (!$otp_record) {
            json_response("error", "Invalid or expired OTP");
        }

        $db->beginTransaction();
        try {
            $stmt = $db->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?");
            $stmt->execute([$otp_record['id']]);

            $stmt = $db->prepare("UPDATE users SET email_verified_at = NOW() WHERE id = ?");
            $stmt->execute([$data['user_id']]);

            $db->commit();
            json_response("success", "Email verified successfully");
        } catch (Exception $e) {
            $db->rollBack();
            json_response("error", "Verification failed: " . $e->getMessage());
        }
        break;

    case 'login':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['email']) || empty($data['password'])) {
            json_response("error", "Missing email or password");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, full_name, password_hash, role, status, email_verified_at FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if (!$user || !Security::verifyData($data['password'], $user['password_hash'])) {
            json_response("error", "Invalid email or password");
        }

        if (!$user['email_verified_at']) {
            json_response("error", "Email not verified", ["user_id" => $user['id']]);
        }

        if ($user['status'] !== 'active') {
            json_response("error", "Account is " . $user['status']);
        }

        $token = Security::generateAccessToken($user['id'], $user['role']);
        $refresh_token = Security::generateRefreshToken();

        // Store session
        $stmt = $db->prepare("INSERT INTO sessions (user_id, token_hash, device, ip_address, user_agent, last_active) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->execute([$user['id'], hash('sha256', $refresh_token), $_SERVER['HTTP_USER_AGENT'] ?? '', $_SERVER['REMOTE_ADDR'] ?? '', $_SERVER['HTTP_USER_AGENT'] ?? '']);

        setcookie("refresh_token", $refresh_token, [
            'expires' => time() + (30 * 24 * 60 * 60),
            'path' => '/',
            'httponly' => true,
            'samesite' => 'Strict'
        ]);

        json_response("success", "Login successful", [
            "access_token" => $token,
            "user" => [
                "id" => $user['id'],
                "full_name" => $user['full_name'],
                "role" => $user['role']
            ]
        ]);
        break;
    case 'refresh_token':
        $token = $_COOKIE['refresh_token'] ?? '';
        if (empty($token)) json_response("error", "No refresh token");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT user_id FROM sessions WHERE token_hash = ? AND revoked_at IS NULL");
        $stmt->execute([hash('sha256', $token)]);
        $session = $stmt->fetch();

        if (!$session) json_response("error", "Invalid session");

        $stmt = $db->prepare("SELECT id, role FROM users WHERE id = ?");
        $stmt->execute([$session['user_id']]);
        $user = $stmt->fetch();

        $new_access_token = Security::generateAccessToken($user['id'], $user['role']);
        json_response("success", "Token refreshed", ["access_token" => $new_access_token]);
        break;

    case 'forgot_password':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['email'])) json_response("error", "Email required");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, full_name FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        $user = $stmt->fetch();

        if ($user) {
            $otp = Security::generateOTP();
            $db->prepare("INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, 'password_reset', ?)")
               ->execute([$user['id'], $otp, date('Y-m-d H:i:s', time() + 600)]);
            EmailService::sendOTPEmail($data['email'], $user['full_name'], $otp, 'password_reset');
        }
        json_response("success", "If email exists, a reset code was sent");
        break;

    case 'reset_password':
        $data = json_decode(file_get_contents("php://input"), true);
        if (empty($data['token']) || empty($data['password'])) json_response("error", "Missing fields");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT user_id, id FROM otp_codes WHERE code = ? AND type = 'password_reset' AND used_at IS NULL AND expires_at > NOW()");
        $stmt->execute([$data['token']]);
        $otp = $stmt->fetch();

        if (!$otp) json_response("error", "Invalid or expired reset code");

        $db->beginTransaction();
        try {
            $hash = Security::hashData($data['password']);
            $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?")->execute([$hash, $otp['user_id']]);
            $db->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?")->execute([$otp['id']]);
            $db->prepare("UPDATE sessions SET revoked_at = NOW() WHERE user_id = ?")->execute([$otp['user_id']]);
            $db->commit();
            json_response("success", "Password reset successful");
        } catch (Exception $e) {
            $db->rollBack();
            json_response("error", "Failed to reset password");
        }
        break;
    case 'resend_otp':
        // Implementation for resend OTP
        break;

    case 'resolve_account':
        $account_number = $_GET['account_number'] ?? '';
        if (empty($account_number)) {
            json_response("error", "Account number required");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT u.full_name as account_holder_name, a.account_number, a.kyc_tier, a.status
                              FROM accounts a JOIN users u ON a.user_id = u.id
                              WHERE a.account_number = ? AND a.status = 'active'");
        $stmt->execute([$account_number]);
        $result = $stmt->fetch();

        if ($result) {
            json_response("success", "Account resolved", $result);
        } else {
            json_response("error", "Account not found or inactive");
        }
        break;

    // Protected Endpoints
    case 'get_account_details':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT a.*, u.full_name, u.email FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.user_id = ?");
        $stmt->execute([$user['sub']]);
        $result = $stmt->fetch();
        json_response("success", "Account details", $result);
        break;

    case 'get_transactions':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM transactions WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?) ORDER BY created_at DESC");
        $stmt->execute([$user['sub']]);
        $result = $stmt->fetchAll();
        json_response("success", "Transactions", $result);
        break;

    case 'internal_transfer':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['receiver_account_number']) || empty($data['amount']) || empty($data['pin'])) {
            json_response("error", "Missing transfer details");
        }

        $db = Database::getInstance()->getConnection();

        // Verify PIN
        $stmt = $db->prepare("SELECT pin_hash FROM users WHERE id = ?");
        $stmt->execute([$user['sub']]);
        $u = $stmt->fetch();
        if (!Security::verifyData($data['pin'], $u['pin_hash'] ?? '')) {
            json_response("error", "Invalid transaction PIN");
        }

        // Get sender and receiver accounts
        $stmt = $db->prepare("SELECT id, balance, kyc_tier FROM accounts WHERE user_id = ?");
        $stmt->execute([$user['sub']]);
        $sender = $stmt->fetch();

        $stmt = $db->prepare("SELECT id, balance FROM accounts WHERE account_number = ? AND status = 'active'");
        $stmt->execute([$data['receiver_account_number']]);
        $receiver = $stmt->fetch();

        if (!$receiver) json_response("error", "Receiver account not found");
        if ($sender['id'] == $receiver['id']) json_response("error", "Cannot transfer to self");
        if ($sender['balance'] < $data['amount']) json_response("error", "Insufficient balance");

        $db->beginTransaction();
        try {
            $ref = "NBK" . time() . strtoupper(bin2hex(random_bytes(3)));

            $db->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?")->execute([$data['amount'], $sender['id']]);
            $db->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?")->execute([$data['amount'], $receiver['id']]);

            $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, counterparty_account_id) VALUES (?, 'debit', 'internal_transfer', ?, ?, ?, ?, ?)")
               ->execute([$sender['id'], $data['amount'], $sender['balance'] - $data['amount'], $data['narration'], $ref, $receiver['id']]);

            $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, counterparty_account_id) VALUES (?, 'credit', 'internal_transfer', ?, ?, ?, ?, ?)")
               ->execute([$receiver['id'], $data['amount'], $receiver['balance'] + $data['amount'], $data['narration'], $ref . "_C", $sender['id']]);

            $db->commit();
            json_response("success", "Transfer completed", ["reference" => $ref]);
        } catch (Exception $e) {
            $db->rollBack();
            json_response("error", "Transfer failed: " . $e->getMessage());
        }
        break;

    case 'get_dashboard':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT balance, ledger_balance, account_number, kyc_tier FROM accounts WHERE user_id = ?");
        $stmt->execute([$user['sub']]);
        $account = $stmt->fetch();

        $stmt = $db->prepare("SELECT id, type, channel, amount, narration, balance_after, created_at FROM transactions WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?) ORDER BY created_at DESC LIMIT 5");
        $stmt->execute([$user['sub']]);
        $txs = $stmt->fetchAll();

        json_response("success", "Dashboard data", array_merge($account, ["recent_transactions" => $txs]));
        break;

    case 'get_kyc_status':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT kyc_tier FROM accounts WHERE user_id = ?");
        $stmt->execute([$user['sub']]);
        $tier = $stmt->fetch();
        json_response("success", "KYC Status", ["kyc_tier" => $tier['kyc_tier']]);
        break;

    case 'submit_kyc':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true);
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO kyc_submissions (user_id, tier_requested, id_front_url, id_back_url, selfie_url, address_doc_url, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->execute([$user['sub'], $data['tier_requested'], $data['id_front_url'], $data['id_back_url'], $data['selfie_url'], $data['address_doc_url']]);
        json_response("success", "KYC Submitted");
        break;

    case 'get_card_details':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || empty($data['pin'])) {
            json_response("error", "Transaction PIN required");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT pin_hash FROM users WHERE id = ?");
        $stmt->execute([$user['sub']]);
        $u = $stmt->fetch();

        if (!Security::verifyData($data['pin'], $u['pin_hash'])) {
            json_response("error", "Invalid PIN");
        }

        $stmt = $db->prepare("SELECT card_number_last4, card_number_hash, cvv_hash, expiry_month, expiry_year, network, status FROM virtual_cards WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?)");
        $stmt->execute([$user['sub']]);
        $card = $stmt->fetch();

        if (!$card) {
            json_response("error", "No virtual card found");
        }

        // In a real app, you'd decrypt card_number_hash and cvv_hash here
        json_response("success", "Card details", [
            "card_number" => "4111 2222 3333 " . $card['card_number_last4'],
            "cvv" => "123",
            "expiry" => str_pad($card['expiry_month'], 2, '0', STR_PAD_LEFT) . "/" . substr($card['expiry_year'], -2),
            "network" => $card['network'],
            "status" => $card['status']
        ]);
        break;

    case 'freeze_card':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE virtual_cards SET status = IF(status='active', 'frozen', 'active') WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?)");
        $stmt->execute([$user['sub']]);
        json_response("success", "Card status updated");
        break;

    case 'logout':
        $token = $_COOKIE['refresh_token'] ?? '';
        if ($token) {
            $db = Database::getInstance()->getConnection();
            $db->prepare("UPDATE sessions SET revoked_at = NOW() WHERE token_hash = ?")
               ->execute([hash('sha256', $token)]);
        }
        setcookie("refresh_token", "", time() - 3600, "/");
        json_response("success", "Logged out");
        break;

    default:
        json_response("error", "Invalid action specified.");
        break;
}
