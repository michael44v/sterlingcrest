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

// Load configurations
require_once 'config.php';
require_once 'Security.php';
require_once 'EmailService.php';

// CORS headers
header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit;
}

// Database Singleton using mysqli
class Database {
    private static $instance = null;
    private $conn;

    private function __construct() {
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        try {
            $this->conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            $this->conn->set_charset("utf8mb4");
        } catch(Exception $e) {
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
    case 'register':
        $data = json_decode(file_get_contents("php://input"), true) ?? [];

        if (empty($data['full_name']) || empty($data['email']) || empty($data['phone']) || empty($data['password'])) {
            json_response("error", "Missing required fields");
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT id FROM users WHERE email = ? OR phone = ?");
        $stmt->bind_param("ss", $data['email'], $data['phone']);
        $stmt->execute();
        if ($stmt->get_result()->fetch_assoc()) {
            json_response("error", "User with this email or phone already exists");
        }

        $password_hash = Security::hashData($data['password']);

        $db->begin_transaction();
        try {
            $stmt = $db->prepare("INSERT INTO users (full_name, email, phone, password_hash) VALUES (?, ?, ?, ?)");
            $stmt->bind_param("ssss", $data['full_name'], $data['email'], $data['phone'], $password_hash);
            $stmt->execute();
            $user_id = $db->insert_id;

            $account_number = str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
            $stmt = $db->prepare("INSERT INTO accounts (user_id, account_number) VALUES (?, ?)");
            $stmt->bind_param("is", $user_id, $account_number);
            $stmt->execute();

            $otp = Security::generateOTP();
            $expires_at = date('Y-m-d H:i:s', time() + 600);
            $stmt = $db->prepare("INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, 'registration', ?)");
            $stmt->bind_param("iss", $user_id, $otp, $expires_at);
            $stmt->execute();

            EmailService::sendOTPEmail($data['email'], $data['full_name'], $otp, 'registration');

            $db->commit();
            json_response("success", "Registration successful. Please verify your email.", ["user_id" => $user_id]);
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Registration failed: " . $e->getMessage());
        }
        break;

    case 'verify_email':
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || empty($data['otp'])) {
            json_response("error", "Missing required fields");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id FROM otp_codes WHERE user_id = ? AND code = ? AND type = 'registration' AND used_at IS NULL AND expires_at > NOW()");
        $stmt->bind_param("is", $data['user_id'], $data['otp']);
        $stmt->execute();
        $otp_record = $stmt->get_result()->fetch_assoc();

        if (!$otp_record) {
            json_response("error", "Invalid or expired OTP");
        }

        $db->begin_transaction();
        try {
            $stmt = $db->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?");
            $stmt->bind_param("i", $otp_record['id']);
            $stmt->execute();

            $stmt = $db->prepare("UPDATE users SET email_verified_at = NOW() WHERE id = ?");
            $stmt->bind_param("i", $data['user_id']);
            $stmt->execute();

            $db->commit();
            json_response("success", "Email verified successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Verification failed: " . $e->getMessage());
        }
        break;

    case 'login':
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['email']) || empty($data['password'])) {
            json_response("error", "Missing email or password");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, full_name, password_hash, role, status, email_verified_at FROM users WHERE email = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if (!$user || !Security::verifyData($data['password'], $user['password_hash'])) {
            json_response("error", "Invalid email or password");
        }

      //  if (!$user['email_verified_at']) {
        //    json_response("error", "Email not verified", ["user_id" => $user['id']]);
        //}

        if ($user['status'] !== 'active') {
            json_response("error", "Account is " . $user['status']);
        }

        $token = Security::generateAccessToken($user['id'], $user['role']);
        $refresh_token = Security::generateRefreshToken();
        $token_hash = hash('sha256', $refresh_token);
        $ua = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $ip = $_SERVER['REMOTE_ADDR'] ?? '';

        $stmt = $db->prepare("INSERT INTO sessions (user_id, token_hash, device, ip_address, user_agent, last_active) VALUES (?, ?, ?, ?, ?, NOW())");
        $stmt->bind_param("issss", $user['id'], $token_hash, $ua, $ip, $ua);
        $stmt->execute();

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
        $token_hash = hash('sha256', $token);
        $stmt = $db->prepare("SELECT user_id FROM sessions WHERE token_hash = ? AND revoked_at IS NULL");
        $stmt->bind_param("s", $token_hash);
        $stmt->execute();
        $session = $stmt->get_result()->fetch_assoc();

        if (!$session) json_response("error", "Invalid session");

        $stmt = $db->prepare("SELECT id, role FROM users WHERE id = ?");
        $stmt->bind_param("i", $session['user_id']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        $new_access_token = Security::generateAccessToken($user['id'], $user['role']);
        json_response("success", "Token refreshed", ["access_token" => $new_access_token]);
        break;

    case 'forgot_password':
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['email'])) json_response("error", "Email required");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, full_name FROM users WHERE email = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();

        if ($user) {
            $otp = Security::generateOTP();
            $expires_at = date('Y-m-d H:i:s', time() + 600);
            $stmt = $db->prepare("INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, 'password_reset', ?)");
            $stmt->bind_param("iss", $user['id'], $otp, $expires_at);
            $stmt->execute();
            EmailService::sendOTPEmail($data['email'], $user['full_name'], $otp, 'password_reset');
        }
        json_response("success", "If email exists, a reset code was sent");
        break;

    case 'reset_password':
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['token']) || empty($data['password'])) json_response("error", "Missing fields");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT user_id, id FROM otp_codes WHERE code = ? AND type = 'password_reset' AND used_at IS NULL AND expires_at > NOW()");
        $stmt->bind_param("s", $data['token']);
        $stmt->execute();
        $otp = $stmt->get_result()->fetch_assoc();

        if (!$otp) json_response("error", "Invalid or expired reset code");

        $db->begin_transaction();
        try {
            $hash = Security::hashData($data['password']);
            $stmt1 = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
            $stmt1->bind_param("si", $hash, $otp['user_id']);
            $stmt1->execute();

            $stmt2 = $db->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?");
            $stmt2->bind_param("i", $otp['id']);
            $stmt2->execute();

            $stmt3 = $db->prepare("UPDATE sessions SET revoked_at = NOW() WHERE user_id = ?");
            $stmt3->bind_param("i", $otp['user_id']);
            $stmt3->execute();

            $db->commit();
            json_response("success", "Password reset successful");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to reset password");
        }
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
        $stmt->bind_param("s", $account_number);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();

        if ($result) {
            json_response("success", "Account resolved", $result);
        } else {
            json_response("error", "Account not found or inactive");
        }
        break;

    case 'get_account_details':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT a.*, u.full_name, u.email FROM accounts a JOIN users u ON a.user_id = u.id WHERE a.user_id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $result = $stmt->get_result()->fetch_assoc();
        json_response("success", "Account details", $result);
        break;

    case 'get_transactions':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM transactions WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?) ORDER BY created_at DESC");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $rows = [];
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
        json_response("success", "Transactions", $rows);
        break;

    case 'get_statement_data':
        $user = require_auth();
        $date_from = $_GET['date_from'] ?? '';
        $date_to = $_GET['date_to'] ?? '';
        
        if (!$date_from || !$date_to) json_response("error", "Date range required");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, balance FROM accounts WHERE user_id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $acc = $stmt->get_result()->fetch_assoc();

        $stmt2 = $db->prepare("SELECT created_at as date, narration, reference, type, amount, balance_after FROM transactions 
                               WHERE account_id = ? AND DATE(created_at) BETWEEN ? AND ? ORDER BY created_at ASC");
        $stmt2->bind_param("iss", $acc['id'], $date_from, $date_to);
        $stmt2->execute();
        $res = $stmt2->get_result();
        $txs = [];
        $totalCredits = 0;
        $totalDebits = 0;
        
        while ($row = $res->fetch_assoc()) {
            $txs[] = $row;
            if ($row['type'] === 'credit') $totalCredits += $row['amount'];
            else $totalDebits += $row['amount'];
        }

        $openingBalance = (count($txs) > 0) ? ($txs[0]['balance_after'] - ($txs[0]['type'] === 'credit' ? $txs[0]['amount'] : -$txs[0]['amount'])) : $acc['balance'];
        $closingBalance = (count($txs) > 0) ? end($txs)['balance_after'] : $acc['balance'];

        json_response("success", "Statement data", [
            "summary" => [
                "openingBalance" => (float)$openingBalance,
                "closingBalance" => (float)$closingBalance,
                "totalCredits" => (float)$totalCredits,
                "totalDebits" => (float)$totalDebits
            ],
            "transactions" => $txs
        ]);
        break;

    case 'internal_transfer':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['receiver_account_number']) || empty($data['amount']) || empty($data['pin'])) {
            json_response("error", "Missing transfer details");
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT pin_hash FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $u = $stmt->get_result()->fetch_assoc();
        if (!Security::verifyData($data['pin'], $u['pin_hash'] ?? '')) {
            json_response("error", "Invalid transaction PIN");
        }

        $stmt1 = $db->prepare("SELECT id, balance, kyc_tier FROM accounts WHERE user_id = ?");
        $stmt1->bind_param("i", $user['sub']);
        $stmt1->execute();
        $sender = $stmt1->get_result()->fetch_assoc();

        $stmt2 = $db->prepare("SELECT id, balance FROM accounts WHERE account_number = ? AND status = 'active'");
        $stmt2->bind_param("s", $data['receiver_account_number']);
        $stmt2->execute();
        $receiver = $stmt2->get_result()->fetch_assoc();

        if (!$receiver) json_response("error", "Receiver account not found");
        if ($sender['id'] == $receiver['id']) json_response("error", "Cannot transfer to self");
        if ($sender['balance'] < $data['amount']) json_response("error", "Insufficient balance");

        // Tiered Limits: Tier 1 ($0), Tier 2 ($5,000), Tier 3 ($50,000)
        $limits = [1 => 1000, 2 => 5000, 3 => 500000000];
        $limit = $limits[$sender['kyc_tier']] ?? 0;

        if ($data['amount'] > $limit) {
            json_response("error", "Transfer amount exceeds your current KYC tier limit of $$limit.");
        }

        // Today's total sent
        $stmt_limit = $db->prepare("SELECT SUM(amount) FROM transactions WHERE account_id = ? AND type = 'debit' AND channel = 'internal_transfer' AND DATE(created_at) = CURDATE()");
        $stmt_limit->bind_param("i", $sender['id']);
        $stmt_limit->execute();
        $today_sent = $stmt_limit->get_result()->fetch_row()[0] ?: 0;

        if (($today_sent + $data['amount']) > $limit) {
            json_response("error", "Daily transfer limit exceeded. Remaining: $" . ($limit - $today_sent));
        }

        $db->begin_transaction();
        try {
            $ref = "NBK" . time() . strtoupper(bin2hex(random_bytes(3)));

            $stmt3 = $db->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
            $stmt3->bind_param("di", $data['amount'], $sender['id']);
            $stmt3->execute();

            $stmt4 = $db->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
            $stmt4->bind_param("di", $data['amount'], $receiver['id']);
            $stmt4->execute();

            $bal_after_s = $sender['balance'] - $data['amount'];
            $stmt5 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, counterparty_account_id) VALUES (?, 'debit', 'internal_transfer', ?, ?, ?, ?, ?)");
            $stmt5->bind_param("iddssi", $sender['id'], $data['amount'], $bal_after_s, $data['narration'], $ref, $receiver['id']);
            $stmt5->execute();
            $sender_tx_id = $db->insert_id;

            $bal_after_r = $receiver['balance'] + $data['amount'];
            $ref_c = $ref . "_C";
            $stmt6 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, counterparty_account_id) VALUES (?, 'credit', 'internal_transfer', ?, ?, ?, ?, ?)");
            $stmt6->bind_param("iddssi", $receiver['id'], $data['amount'], $bal_after_r, $data['narration'], $ref_c, $sender['id']);
            $stmt6->execute();

            if ($data['amount'] > 1000000) {
                $reason = "High value transfer: $" . number_format($data['amount'], 2);
                $stmt_aml = $db->prepare("INSERT INTO aml_flags (transaction_id, reason) VALUES (?, ?)");
                $stmt_aml->bind_param("is", $sender_tx_id, $reason);
                $stmt_aml->execute();
            }

            $db->commit();
            json_response("success", "Transfer completed", ["reference" => $ref]);
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Transfer failed: " . $e->getMessage());
        }
        break;

   case 'get_dashboard':
    $user = require_auth();
    $db = Database::getInstance()->getConnection();

    // 1. Get Account Details
    $stmt = $db->prepare("SELECT id, balance, ledger_balance, account_number, kyc_tier FROM accounts WHERE user_id = ?");
    $stmt->bind_param("i", $user['sub']);
    $stmt->execute();
    $account = $stmt->get_result()->fetch_assoc();

    if (!$account) {
        json_response("error", "Account not found");
        break;
    }

    $accountId = $account['id'];

    // 2. Get Recent Transactions
    $stmt2 = $db->prepare("SELECT id, type, channel, amount, narration, balance_after, created_at FROM transactions WHERE account_id = ? ORDER BY created_at DESC LIMIT 5");
    $stmt2->bind_param("i", $accountId);
    $stmt2->execute();
    $res = $stmt2->get_result();
    $txs = [];
    while ($row = $res->fetch_assoc()) {
        $txs[] = $row;
    }

    // 3. Get Totals (Credit & Debit in ONE query to save resources)
    $stmt3 = $db->prepare("
        SELECT 
            SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) AS total_credit,
            SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) AS total_debit 
        FROM transactions 
        WHERE account_id = ?
    ");
    $stmt3->bind_param("i", $accountId);
    $stmt3->execute();
    $totals = $stmt3->get_result()->fetch_assoc();

    $total_credit = $totals['total_credit'] ?? 0;
    $total_debit = $totals['total_debit'] ?? 0;

    // 4. Send Clean JSON Response
    json_response("success", "Dashboard data", array_merge($account, [
        "recent_transactions" => $txs,
        "total_credit_sum" => (float)$total_credit,
        "total_debit_sum" => (float)$total_debit
    ]));
    break;

    case 'get_kyc_status':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT kyc_tier FROM accounts WHERE user_id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $tier = $stmt->get_result()->fetch_assoc();
        json_response("success", "KYC Status", ["kyc_tier" => $tier['kyc_tier']]);
        break;

    case 'submit_kyc':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO kyc_submissions (user_id, tier_requested, id_front_url, id_back_url, selfie_url, address_doc_url, status) VALUES (?, ?, ?, ?, ?, ?, 'pending')");
        $stmt->bind_param("iissss", $user['sub'], $data['tier_requested'], $data['id_front_url'], $data['id_back_url'], $data['selfie_url'], $data['address_doc_url']);
        $stmt->execute();
        json_response("success", "KYC Submitted");
        break;

    case 'deposit':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['amount']) || empty($data['method'])) json_response("error", "Amount and method required");

        $db = Database::getInstance()->getConnection();
        $stmt1 = $db->prepare("SELECT id, balance FROM accounts WHERE user_id = ?");
        $stmt1->bind_param("i", $user['sub']);
        $stmt1->execute();
        $acc = $stmt1->get_result()->fetch_assoc();

        $db->begin_transaction();
        try {
            $ref = "DEP" . time() . strtoupper(bin2hex(random_bytes(3)));
            
            if ($data['method'] === 'card') {
                $stmt2 = $db->prepare("UPDATE accounts SET balance = balance + ? WHERE id = ?");
                $stmt2->bind_param("di", $data['amount'], $acc['id']);
                $stmt2->execute();
                
                $bal_after = $acc['balance'] + $data['amount'];
                $stmt3 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, status) VALUES (?, 'credit', 'deposit', ?, ?, 'Card Deposit', ?, 'completed')");
                $stmt3->bind_param("idds", $acc['id'], $data['amount'], $bal_after, $ref);
                $stmt3->execute();
            } else {
                $stmt3 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, status) VALUES (?, 'credit', 'deposit', ?, ?, 'Bank Wire Deposit', ?, 'pending')");
                $bal_after = $acc['balance']; // stays same until confirmed
                $stmt3->bind_param("idds", $acc['id'], $data['amount'], $bal_after, $ref);
                $stmt3->execute();
            }

            $db->commit();
            json_response("success", "Deposit processed");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Deposit failed");
        }
        break;

    case 'get_fixed_deposits':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM fixed_deposits WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?) ORDER BY start_date DESC");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $rows = [];
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
        json_response("success", "Fixed deposits", $rows);
        break;

    case 'create_fixed_deposit':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['amount']) || empty($data['tenor_days']) || empty($data['pin'])) {
            json_response("error", "Missing required fields");
        }

        $db = Database::getInstance()->getConnection();

        $stmt = $db->prepare("SELECT pin_hash FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $u = $stmt->get_result()->fetch_assoc();
        if (!Security::verifyData($data['pin'], $u['pin_hash'] ?? '')) {
            json_response("error", "Invalid transaction PIN");
        }

        $stmt1 = $db->prepare("SELECT id, balance, kyc_tier FROM accounts WHERE user_id = ?");
        $stmt1->bind_param("i", $user['sub']);
        $stmt1->execute();
        $acc = $stmt1->get_result()->fetch_assoc();

        if ($acc['kyc_tier'] < 3) json_response("error", "Tier 3 KYC required for fixed deposits");
        if ($acc['balance'] < $data['amount']) json_response("error", "Insufficient balance");

        $rates = [30 => 3, 90 => 4.5, 180 => 5.5, 365 => 7];
        $rate = $rates[$data['tenor_days']] ?? 3;

        $db->begin_transaction();
        try {
            $stmt2 = $db->prepare("UPDATE accounts SET balance = balance - ? WHERE id = ?");
            $stmt2->bind_param("di", $data['amount'], $acc['id']);
            $stmt2->execute();

            $start_date = date('Y-m-d');
            $maturity_date = date('Y-m-d', strtotime("+$data[tenor_days] days"));
            $stmt3 = $db->prepare("INSERT INTO fixed_deposits (account_id, principal, rate, tenor_days, start_date, maturity_date) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt3->bind_param("ididss", $acc['id'], $data['amount'], $rate, $data['tenor_days'], $start_date, $maturity_date);
            $stmt3->execute();

            $ref = "FD" . time();
            $bal_after = $acc['balance'] - $data['amount'];
            $stmt4 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference) VALUES (?, 'debit', 'fee', ?, ?, 'Fixed Deposit Lock', ?)");
            $stmt4->bind_param("idds", $acc['id'], $data['amount'], $bal_after, $ref);
            $stmt4->execute();

            $db->commit();
            json_response("success", "Fixed deposit created");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed: " . $e->getMessage());
        }
        break;

    case 'get_card_details':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['pin'])) {
            json_response("error", "Transaction PIN required");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT pin_hash FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $u = $stmt->get_result()->fetch_assoc();

        if (!Security::verifyData($data['pin'], $u['pin_hash'])) {
            json_response("error", "Invalid PIN");
        }

        $stmt2 = $db->prepare("SELECT card_number_last4, card_number_hash, cvv_hash, expiry_month, expiry_year, network, status FROM virtual_cards WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?)");
        $stmt2->bind_param("i", $user['sub']);
        $stmt2->execute();
        $card = $stmt2->get_result()->fetch_assoc();

        if (!$card) {
            json_response("error", "No virtual card found");
        }

        json_response("success", "Card details", [
            "card_number" => "4111 2222 3333 " . $card['card_number_last4'],
            "cvv" => "123",
            "expiry" => str_pad($card['expiry_month'], 2, '0', STR_PAD_LEFT) . "/" . substr($card['expiry_year'], -2),
            "network" => $card['network'],
            "status" => $card['status']
        ]);
        break;

    case 'get_profile':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $profile = $stmt->get_result()->fetch_assoc();
        json_response("success", "Profile data", $profile);
        break;

    case 'update_profile':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['full_name']) || empty($data['phone'])) json_response("error", "Missing fields");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE users SET full_name = ?, phone = ? WHERE id = ?");
        $stmt->bind_param("ssi", $data['full_name'], $data['phone'], $user['sub']);
        $stmt->execute();
        json_response("success", "Profile updated");
        break;

    case 'set_pin':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($_GET['pin'])) json_response("error", "PIN required");

        $db = Database::getInstance()->getConnection();
        $pin_hash = Security::hashData($_GET['pin']);
        $stmt = $db->prepare("UPDATE users SET pin_hash = ? WHERE id = ?");
        $stmt->bind_param("si", $pin_hash, $user['sub']);
        $stmt->execute();
        json_response("success", "Transaction PIN updated");
        break;

    case 'freeze_card':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE virtual_cards SET status = IF(status='active', 'frozen', 'active') WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?)");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        json_response("success", "Card status updated");
        break;

    case 'admin_get_analytics':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();

        $stats = [];
        $stats['total_users'] = $db->query("SELECT COUNT(*) FROM users")->fetch_row()[0];
        $stats['active_accounts'] = $db->query("SELECT COUNT(*) FROM accounts WHERE status = 'active'")->fetch_row()[0];
        $stats['total_balance'] = $db->query("SELECT SUM(balance) FROM accounts")->fetch_row()[0] ?: 0;
        $stats['pending_kyc'] = $db->query("SELECT COUNT(*) FROM kyc_submissions WHERE status = 'pending'")->fetch_row()[0];

        json_response("success", "Analytics data", $stats);
        break;

    case 'admin_get_users':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $res = $db->query("SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, a.account_number, a.balance, a.kyc_tier
                           FROM users u JOIN accounts a ON u.id = a.user_id ORDER BY u.created_at DESC");
        $users = [];
        while ($row = $res->fetch_assoc()) { $users[] = $row; }
        json_response("success", "User list", $users);
        break;

    case 'admin_get_kyc_queue':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $res = $db->query("SELECT k.*, u.full_name, u.email FROM kyc_submissions k JOIN users u ON k.user_id = u.id WHERE k.status = 'pending' ORDER BY k.created_at ASC");
        $queue = [];
        while ($row = $res->fetch_assoc()) { $queue[] = $row; }
        json_response("success", "KYC Queue", $queue);
        break;

    case 'admin_get_transactions':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $res = $db->query("SELECT t.*, u.full_name as user_name, a.account_number
                           FROM transactions t
                           JOIN accounts a ON t.account_id = a.id
                           JOIN users u ON a.user_id = u.id
                           ORDER BY t.created_at DESC");
        $txs = [];
        while ($row = $res->fetch_assoc()) { $txs[] = $row; }
        json_response("success", "Transactions", $txs);
        break;

    case 'admin_review_kyc':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['submission_id']) || empty($data['decision'])) json_response("error", "Missing fields");

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            $stmt = $db->prepare("UPDATE kyc_submissions SET status = ?, reviewed_by = ?, reviewed_at = NOW(), rejection_reason = ? WHERE id = ?");
            $reason = $data['rejection_reason'] ?? null;
            $stmt->bind_param("sisi", $data['decision'], $user['sub'], $reason, $data['submission_id']);
            $stmt->execute();

            if ($data['decision'] === 'approved') {
                $stmt2 = $db->prepare("SELECT user_id, tier_requested FROM kyc_submissions WHERE id = ?");
                $stmt2->bind_param("i", $data['submission_id']);
                $stmt2->execute();
                $sub = $stmt2->get_result()->fetch_assoc();

                $stmt3 = $db->prepare("UPDATE accounts SET kyc_tier = ? WHERE user_id = ?");
                $stmt3->bind_param("ii", $sub['tier_requested'], $sub['user_id']);
                $stmt3->execute();
            }

            $db->commit();
            json_response("success", "KYC reviewed successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to review KYC: " . $e->getMessage());
        }
        break;

    case 'admin_get_aml_flags':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT f.*, t.amount, t.narration, t.reference, u.full_name as user_name
                              FROM aml_flags f
                              JOIN transactions t ON f.transaction_id = t.id
                              JOIN accounts a ON t.account_id = a.id
                              JOIN users u ON a.user_id = u.id
                              ORDER BY f.created_at DESC");
        $stmt->execute();
        $rows = [];
        $res = $stmt->get_result();
        while ($row = $res->fetch_assoc()) {
            $rows[] = $row;
        }
        json_response("success", "AML Flags", $rows);
        break;

    case 'admin_resolve_aml_flag':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['flag_id']) || empty($data['decision'])) json_response("error", "Missing fields");

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE aml_flags SET status = ?, reviewed_by = ?, reviewed_at = NOW() WHERE id = ?");
        $stmt->bind_param("sii", $data['decision'], $user['sub'], $data['flag_id']);
        $stmt->execute();

        if ($data['decision'] === 'escalated') {
            // Freeze user account as an example action
            $stmt2 = $db->prepare("UPDATE users SET status = 'suspended' WHERE id = (SELECT user_id FROM accounts WHERE id = (SELECT account_id FROM transactions WHERE id = (SELECT transaction_id FROM aml_flags WHERE id = ?)))");
            $stmt2->bind_param("i", $data['flag_id']);
            $stmt2->execute();
        }

        json_response("success", "AML Flag resolved");
        break;

    case 'get_beneficiaries':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM beneficiaries WHERE user_id = ? ORDER BY created_at DESC");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($row = $res->fetch_assoc()) { $rows[] = $row; }
        json_response("success", "Beneficiaries", $rows);
        break;

    case 'add_beneficiary':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['account_number']) || empty($data['account_name'])) json_response("error", "Missing fields");
        
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO beneficiaries (user_id, account_number, account_name) VALUES (?, ?, ?)");
        $stmt->bind_param("iss", $user['sub'], $data['account_number'], $data['account_name']);
        $stmt->execute();
        json_response("success", "Beneficiary added");
        break;

    case 'logout':
        $token = $_COOKIE['refresh_token'] ?? '';
        if ($token) {
            $db = Database::getInstance()->getConnection();
            $token_hash = hash('sha256', $token);
            $stmt = $db->prepare("UPDATE sessions SET revoked_at = NOW() WHERE token_hash = ?");
            $stmt->bind_param("s", $token_hash);
            $stmt->execute();
        }
        setcookie("refresh_token", "", time() - 3600, "/");
        json_response("success", "Logged out");
        break;

    default:
        json_response("error", "Invalid action specified.");
        break;
}
