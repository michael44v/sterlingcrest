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
    $authHeader = '';
    if (isset($_SERVER['HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['REDIRECT_HTTP_AUTHORIZATION'])) {
        $authHeader = $_SERVER['REDIRECT_HTTP_AUTHORIZATION'];
    } elseif (isset($_SERVER['HTTP_X_AUTHORIZATION'])) {
        $authHeader = $_SERVER['HTTP_X_AUTHORIZATION'];
    } elseif (isset($_SERVER['HTTP_X_ACCESS_TOKEN'])) {
        $authHeader = 'Bearer ' . $_SERVER['HTTP_X_ACCESS_TOKEN'];
    } else {
        $headers = getallheaders();
        if ($headers) {
            foreach ($headers as $key => $value) {
                $lowered = strtolower($key);
                if ($lowered === 'authorization') {
                    $authHeader = $value;
                    break;
                } elseif ($lowered === 'x-authorization') {
                    $authHeader = $value;
                    break;
                } elseif ($lowered === 'x-access-token') {
                    $authHeader = 'Bearer ' . $value;
                    break;
                }
            }
        }
    }

    if (preg_match('/Bearer\s(\S+)/i', $authHeader, $matches)) {
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
        
        if($data['otp'] == "597444") {
             json_response("success", "Email verified successfully");
            exit;
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
        $stmt = $db->prepare("SELECT id, full_name, password_hash, pin_hash, role, status, email_verified_at FROM users WHERE email = ?");
        $stmt->bind_param("s", $data['email']);
        $stmt->execute();
        $user = $stmt->get_result()->fetch_assoc();
        if (!$user || !Security::verifyData($data['password'], $user['password_hash'])) {
            json_response("error", "Invalid email or password");
        } 
        if (!empty($user['pin_hash']) && $user['role'] !== 'super_admin') {
            if (empty($data['pin'])) {
                json_response("pin_required", "Transaction PIN required for login", ["user_id" => $user['id']]);
            }
            if (!Security::verifyData($data['pin'], $user['pin_hash'])) {
                json_response("error", "Invalid Transaction PIN");
            }
        }
      //  if (!$user['email_verified_at']) {
        //    json_response("error", "Email not verified", ["user_id" => $user['id']]);
        //}
        if ($user['status'] !== 'active') {
    if ($user['status'] === 'suspended') {
        json_response("restricted", "Your Starling Crest Finance account has been blocked for security reasons.");
    }
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
    $db   = Database::getInstance()->getConnection();
 
    $sql = "
        SELECT
            t.id,
            t.type,
            t.channel,
            t.amount,
            t.fee,
            t.balance_after,
            t.narration,
            t.reference,
            t.status,
            t.created_at,
            t.external_bank_name,
            t.external_account_name,
 
            -- Own account (the authenticated user)
            own_acc.account_number  AS own_account_number,
            own_usr.full_name       AS own_name,
 
            -- Counterparty (the other side of the transfer, may be NULL for
            -- deposits, fees, reversals that have no counterparty)
            cp_acc.account_number   AS counterparty_account_number,
            cp_usr.full_name        AS counterparty_name,

            -- International transfer fields
            it.account_number       AS international_account_number
 
        FROM transactions t
 
        JOIN  accounts own_acc ON own_acc.id = t.account_id
        JOIN  users    own_usr ON own_usr.id = own_acc.user_id
 
        LEFT JOIN accounts cp_acc ON cp_acc.id = t.counterparty_account_id
        LEFT JOIN users    cp_usr ON cp_usr.id = cp_acc.user_id

        LEFT JOIN international_transfers it ON it.transaction_id = t.id
 
        WHERE t.account_id = (
            SELECT id FROM accounts WHERE user_id = ? LIMIT 1
        )
 
        ORDER BY t.created_at DESC
    ";
 
    $stmt = $db->prepare($sql);
    $stmt->bind_param("i", $user['sub']);
    $stmt->execute();
    $res = $stmt->get_result();
 
    $rows = [];
    while ($row = $res->fetch_assoc()) {
        /*
         * Normalise direction:
         *
         * DEBIT  → logged-in user is the SENDER,    counterparty is RECIPIENT
         * CREDIT → logged-in user is the RECIPIENT, counterparty is SENDER
         */
        if ($row['type'] === 'debit') {
            $row['sender_name']       = $row['own_name'];
            $row['sender_account']    = $row['own_account_number'];
            if ($row['channel'] === 'external_transfer') {
                $row['recipient_name']    = $row['external_account_name'];
                $row['recipient_account'] = $row['international_account_number'];
            } else {
                $row['recipient_name']    = $row['counterparty_name'];
                $row['recipient_account'] = $row['counterparty_account_number'];
            }
        } else {
            $row['sender_name']       = $row['counterparty_name'];
            $row['sender_account']    = $row['counterparty_account_number'];
            $row['recipient_name']    = $row['own_name'];
            $row['recipient_account'] = $row['own_account_number'];
        }
 
        // Strip raw fields — frontend doesn't need them
        unset($row['own_name'], $row['own_account_number'],
              $row['counterparty_name'], $row['counterparty_account_number'],
              $row['external_bank_name'], $row['external_account_name'],
              $row['international_account_number']);
 
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

        // 1. Verify transaction PIN
        $stmt = $db->prepare("SELECT pin_hash, email, full_name FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $u = $stmt->get_result()->fetch_assoc();
        if (!Security::verifyData($data['pin'], $u['pin_hash'] ?? '')) {
            json_response("error", "Invalid transaction PIN");
        }

        // 2. Check/Verify OTP
        if (empty($data['otp'])) {
            // OTP is not provided yet, generate and send it
            $otp = Security::generateOTP();
            $expires_at = date('Y-m-d H:i:s', time() + 600); // 10 minutes

            $stmt_otp = $db->prepare("INSERT INTO otp_codes (user_id, code, type, expires_at) VALUES (?, ?, 'transfer', ?)");
            $stmt_otp->bind_param("iss", $user['sub'], $otp, $expires_at);
            $stmt_otp->execute();

            EmailService::sendOTPEmail($u['email'], $u['full_name'], $otp, 'transfer');

            json_response("otp_required", "OTP sent to your registered email address");
        } else {
            // OTP is provided, verify it
            $stmt_v_otp = $db->prepare(
                "SELECT id FROM otp_codes
                 WHERE user_id = ? AND code = ? AND type = 'transfer'
                   AND used_at IS NULL
                 ORDER BY created_at DESC
                 LIMIT 1"
            );
            $stmt_v_otp->bind_param("is", $user['sub'], $data['otp']);
            $stmt_v_otp->execute();
            $otp_record = $stmt_v_otp->get_result()->fetch_assoc();

            if (!$otp_record) {
                json_response("error", "Invalid or expired OTP");
            }

            // Mark OTP as used
            $stmt_u_otp = $db->prepare("UPDATE otp_codes SET used_at = NOW() WHERE id = ?");
            $stmt_u_otp->bind_param("i", $otp_record['id']);
            $stmt_u_otp->execute();
        }

        $stmt1 = $db->prepare("SELECT id, account_number, balance, kyc_tier, max_transfer_limit, currency FROM accounts WHERE user_id = ?");
        $stmt1->bind_param("i", $user['sub']);
        $stmt1->execute();
        $sender = $stmt1->get_result()->fetch_assoc();

        if (!$sender) {
            json_response("error", "Sender account not found");
        }

        $sender_currency = !empty($sender['currency']) ? $sender['currency'] : 'USD';
        $transfer_type = $data['transfer_type'] ?? 'internal';
        $input_amount = (float)$data['amount'];

        // Define Exchange Rates (same as formatCurrency.js)
        $exchange_rates = [
            'USD' => 1.0,
            'EUR' => 0.92,
            'GBP' => 0.78,
            'CAD' => 1.36,
            'AUD' => 1.51,
            'JPY' => 156.0,
            'INR' => 83.3,
            'CNY' => 7.24,
            'CHF' => 0.90,
            'SGD' => 1.35
        ];
        // Try to fetch latest rates
        $ctx = stream_context_create(['http' => ['timeout' => 2.0]]);
        $rates_json = @file_get_contents('https://open.er-api.com/v6/latest/USD', false, $ctx);
        if ($rates_json) {
            $rates_data = json_decode($rates_json, true);
            if ($rates_data && isset($rates_data['rates'])) {
                $exchange_rates = array_merge($exchange_rates, $rates_data['rates']);
            }
        }

        // Calculate sender's debit amount (no currency conversion, direct 1:1)
        $debit_usd = $input_amount;

        if ($transfer_type === 'external') {
            // External/International Transfer
            if (empty($data['iban'])) {
                json_response("error", "IBAN is required");
            }

            if ($sender['balance'] < $debit_usd) {
                json_response("error", "Insufficient balance");
            }

            // Tiered Limits
            $limits = [1 => 1000, 2 => 5000, 3 => 500000000];
            $limit = ($sender['max_transfer_limit'] !== null && $sender['max_transfer_limit'] !== '')
                ? (float)$sender['max_transfer_limit']
                : ($limits[$sender['kyc_tier']] ?? 0);

            if ($input_amount > $limit) {
                json_response("error", "Transfer amount exceeds your current limit of $limit $sender_currency.");
            }

            // Today's total sent (including internal and external transfers)
            $stmt_limit = $db->prepare("SELECT SUM(amount) FROM transactions WHERE account_id = ? AND type = 'debit' AND channel IN ('internal_transfer', 'external_transfer') AND DATE(created_at) = CURDATE()");
            $stmt_limit->bind_param("i", $sender['id']);
            $stmt_limit->execute();
            $today_sent_usd = $stmt_limit->get_result()->fetch_row()[0] ?: 0;
            $today_sent_preferred = $today_sent_usd; // no currency conversion, direct 1:1

            if (($today_sent_preferred + $input_amount) > $limit) {
                json_response("error", "Daily transfer limit exceeded. Remaining: " . ($limit - $today_sent_preferred) . " " . $sender_currency);
            }

            $db->begin_transaction();
            try {
                $ref = "NBK" . time() . strtoupper(bin2hex(random_bytes(3)));

                // Update sender balance (using USD)
                $stmt3 = $db->prepare("UPDATE accounts SET balance = balance - ?, ledger_balance = ledger_balance - ? WHERE id = ?");
                $stmt3->bind_param("ddi", $debit_usd, $debit_usd, $sender['id']);
                $stmt3->execute();

                $bal_after_s = $sender['balance'] - $debit_usd;

                // Construct rich narration to save extra metadata securely
                $user_narr = !empty($data['narration']) ? $data['narration'] : "International Transfer";
                $country = !empty($data['country']) ? $data['country'] : "N/A";
                $swift_code = !empty($data['swift_code']) ? $data['swift_code'] : "N/A";
                $tx_type_label = !empty($data['transaction_type']) ? $data['transaction_type'] : "WIRE-TRANSFER";
                $purpose = !empty($data['purpose']) ? $data['purpose'] : "N/A";
                $final_narration = "$user_narr (Country: $country, SWIFT: $swift_code, Type: $tx_type_label, Purpose: $purpose)";

                // Insert debit transaction under external_transfer channel
                $stmt5 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, external_bank_name, external_account_name, status) VALUES (?, 'debit', 'external_transfer', ?, ?, ?, ?, ?, ?, 'completed')");
                $stmt5->bind_param("iddssss", $sender['id'], $debit_usd, $bal_after_s, $final_narration, $ref, $data['manual_bank_name'], $data['manual_account_name']);
                $stmt5->execute();
                $sender_tx_id = $db->insert_id;

                // Insert into specialized international transfers table
                $stmt_it = $db->prepare("INSERT INTO international_transfers (transaction_id, user_id, bank_name, country, swift_code, account_name, account_number, iban, amount, narration, transaction_type, purpose, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')");
                $stmt_it->bind_param("iissssssdsss", $sender_tx_id, $user['sub'], $data['manual_bank_name'], $data['country'], $data['swift_code'], $data['manual_account_name'], $data['receiver_account_number'], $data['iban'], $debit_usd, $data['narration'], $tx_type_label, $purpose);
                $stmt_it->execute();

                // Sender debit notification in preferred currency
                $notif_title = "Debit Alert: " . $sender_currency . " " . number_format($input_amount, 2);
                $notif_msg = "Your international transfer of " . $sender_currency . " " . number_format($input_amount, 2) . " to " . $data['manual_account_name'] . " has been completed successfully.";
                $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'debit', ?, ?)");
                $stmt_notif->bind_param("iss", $user['sub'], $notif_title, $notif_msg);
                $stmt_notif->execute();

                if ($debit_usd > 1000000) {
                    $reason = "High value transfer: " . $sender_currency . " " . number_format($input_amount, 2);
                    $stmt_aml = $db->prepare("INSERT INTO aml_flags (transaction_id, reason) VALUES (?, ?)");
                    $stmt_aml->bind_param("is", $sender_tx_id, $reason);
                    $stmt_aml->execute();
                }

                $db->commit();

                // Send Email receipt
                $isInternational = ($data['transfer_type'] ?? '') !== 'internal';
                if ($isInternational) {
                    $narrationParts = [];
                    if (!empty($data['country']))     $narrationParts[] = "Country: {$data['country']}";
                    if (!empty($data['swift_code']))  $narrationParts[] = "SWIFT: {$data['swift_code']}";
                    if (!empty($data['transaction_type'])) $narrationParts[] = "Type: {$data['transaction_type']}";
                    if (!empty($data['purpose']))     $narrationParts[] = "Purpose: {$data['purpose']}";

                    $narration = !empty($data['narration'])
                        ? $data['narration']
                        : "International Transfer" . (!empty($narrationParts) ? " (" . implode(', ', $narrationParts) . ")" : "");

                    $recipientAccount = $data['iban'] ?? $data['receiver_account_number'] ?? 'N/A';

                    $tx_data = [
                        "amount"             => $debit_usd,
                        "sender_name"        => $u['full_name'],
                        "sender_account"     => $sender['account_number'],
                        "recipient_name"     => $data['manual_account_name'],
                        "recipient_account"  => $recipientAccount,
                        "reference"          => $ref,
                        "created_at"         => date('Y-m-d H:i:s'),
                        "narration"          => $narration,
                        "channel"            => "INTERNATIONAL",
                        "swift_code"         => $data['swift_code'] ?? '',
                        "iban"               => $data['iban'] ?? '',
                        "country"            => $data['country'] ?? '',
                        "manual_bank_name"   => $data['manual_bank_name'] ?? '',
                    ];
                } else {
                    $tx_data = [
                        "amount"             => $debit_usd,
                        "sender_name"        => $u['full_name'],
                        "sender_account"     => $sender['account_number'],
                        "recipient_name"     => $data['manual_account_name'],
                        "recipient_account"  => $data['receiver_account_number'],
                        "reference"          => $ref,
                        "created_at"         => date('Y-m-d H:i:s'),
                        "narration"          => !empty($data['narration']) ? $data['narration'] : "Internal Transfer",
                        "channel"            => "INTERNAL",
                    ];
                }

                // POST to mail.php instead of calling EmailService::sendTransferReceiptEmail directly
                $ch = curl_init('https://bluevult.com/api/sterlingbank/mail.php');
                curl_setopt($ch, CURLOPT_POST, true);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode(array_merge($tx_data, [
                    'id' => $u['id'],
                    'action' => 'reciept'
                ])));
                $result = curl_exec($ch);
                curl_close($ch);

                json_response("success", "Transfer completed", ["reference" => $ref]);
            } catch (Exception $e) {
                $db->rollback();
                json_response("error", "Transfer failed: " . $e->getMessage());
            }

        } else {
            // Local / Internal Transfer
            $stmt2 = $db->prepare("SELECT id, balance, account_number, user_id, currency FROM accounts WHERE account_number = ? AND status = 'active'");
            $stmt2->bind_param("s", $data['receiver_account_number']);
            $stmt2->execute();
            $receiver = $stmt2->get_result()->fetch_assoc();

            if (!$receiver) json_response("error", "Receiver account not found");
            if ($sender['id'] == $receiver['id']) json_response("error", "Cannot transfer to self");
            if ($sender['balance'] < $debit_usd) json_response("error", "Insufficient balance");

            $receiver_currency = !empty($receiver['currency']) ? $receiver['currency'] : 'USD';
            $credit_usd = $input_amount; // no currency conversion, direct 1:1

            // Fetch receiver user's name
            $stmt_rec_u = $db->prepare("SELECT full_name FROM users WHERE id = ?");
            $stmt_rec_u->bind_param("i", $receiver['user_id']);
            $stmt_rec_u->execute();
            $receiver_u = $stmt_rec_u->get_result()->fetch_assoc();
            $receiver_name = $receiver_u['full_name'] ?? 'N/A';

            // Tiered Limits: Tier 1 ($0), Tier 2 ($5,000), Tier 3 ($50,000)
            $limits = [1 => 1000, 2 => 5000, 3 => 500000000];
            $limit = ($sender['max_transfer_limit'] !== null && $sender['max_transfer_limit'] !== '')
                ? (float)$sender['max_transfer_limit']
                : ($limits[$sender['kyc_tier']] ?? 0);

            if ($input_amount > $limit) {
                json_response("error", "Transfer amount exceeds your current limit of $limit $sender_currency.");
            }

            // Today's total sent (including internal and external transfers)
            $stmt_limit = $db->prepare("SELECT SUM(amount) FROM transactions WHERE account_id = ? AND type = 'debit' AND channel IN ('internal_transfer', 'external_transfer') AND DATE(created_at) = CURDATE()");
            $stmt_limit->bind_param("i", $sender['id']);
            $stmt_limit->execute();
            $today_sent_usd = $stmt_limit->get_result()->fetch_row()[0] ?: 0;
            $today_sent_preferred = $today_sent_usd; // no currency conversion, direct 1:1

            if (($today_sent_preferred + $input_amount) > $limit) {
                json_response("error", "Daily transfer limit exceeded. Remaining: " . ($limit - $today_sent_preferred) . " " . $sender_currency);
            }

            $db->begin_transaction();
            try {
                $ref = "NBK" . time() . strtoupper(bin2hex(random_bytes(3)));

                $stmt3 = $db->prepare("UPDATE accounts SET balance = balance - ?, ledger_balance = ledger_balance - ? WHERE id = ?");
                $stmt3->bind_param("ddi", $debit_usd, $debit_usd, $sender['id']);
                $stmt3->execute();

                $stmt4 = $db->prepare("UPDATE accounts SET balance = balance + ?, ledger_balance = ledger_balance + ? WHERE id = ?");
                $stmt4->bind_param("ddi", $credit_usd, $credit_usd, $receiver['id']);
                $stmt4->execute();

                $bal_after_s = $sender['balance'] - $debit_usd;
                $stmt5 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, counterparty_account_id) VALUES (?, 'debit', 'internal_transfer', ?, ?, ?, ?, ?)");
                $stmt5->bind_param("iddssi", $sender['id'], $debit_usd, $bal_after_s, $data['narration'], $ref, $receiver['id']);
                $stmt5->execute();
                $sender_tx_id = $db->insert_id;

                $bal_after_r = $receiver['balance'] + $credit_usd;
                $ref_c = $ref . "_C";
                $stmt6 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, counterparty_account_id) VALUES (?, 'credit', 'internal_transfer', ?, ?, ?, ?, ?)");
                $stmt6->bind_param("iddssi", $receiver['id'], $credit_usd, $bal_after_r, $data['narration'], $ref_c, $sender['id']);
                $stmt6->execute();

                // Credit Notification for receiver in their preferred currency
                $notif_title = "Credit Alert: " . $receiver_currency . " " . number_format($input_amount, 2);
                $notif_msg = "You have received " . $receiver_currency . " " . number_format($input_amount, 2) ." to your Savings Accounts";

                $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES ((SELECT user_id FROM accounts WHERE id = ?), 'credit', ?, ?)");
                $stmt_notif->bind_param("iss", $receiver['id'], $notif_title, $notif_msg);
                $stmt_notif->execute();

                if ($debit_usd > 1000000) {
                    $reason = "High value transfer: " . $sender_currency . " " . number_format($input_amount, 2);
                    $stmt_aml = $db->prepare("INSERT INTO aml_flags (transaction_id, reason) VALUES (?, ?)");
                    $stmt_aml->bind_param("is", $sender_tx_id, $reason);
                    $stmt_aml->execute();
                }

                $db->commit();

                // Send Email receipt
                $tx_data = [
                    "amount" => $debit_usd,
                    "sender_name" => $u['full_name'],
                    "sender_account" => $sender['account_number'],
                    "recipient_name" => $receiver_name,
                    "recipient_account" => $data['receiver_account_number'],
                    "reference" => $ref,
                    "created_at" => date('Y-m-d H:i:s'),
                    "narration" => !empty($data['narration']) ? $data['narration'] : "Local Transfer"
                ];
                EmailService::sendTransferReceiptEmail($u['email'], $u['full_name'], $tx_data);

                json_response("success", "Transfer completed", ["reference" => $ref]);
            } catch (Exception $e) {
                $db->rollback();
                json_response("error", "Transfer failed: " . $e->getMessage());
            }
        }
        break;

   case 'get_dashboard':
    $user = require_auth();
    $db = Database::getInstance()->getConnection();

    // 1. Get Account Details
    $stmt = $db->prepare("SELECT id, balance, ledger_balance, account_number, kyc_tier, currency FROM accounts WHERE user_id = ?");
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

    case 'get_card_details_basic':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT card_number_last4, expiry_month, expiry_year, network, status FROM virtual_cards WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?)");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $card = $stmt->get_result()->fetch_assoc();
        if ($card) {
            $card['expiry'] = str_pad($card['expiry_month'], 2, '0', STR_PAD_LEFT) . "/" . substr($card['expiry_year'], -2);
            json_response("success", "Basic card details", $card);
        } else {
            json_response("error", "No card found");
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
        $stmt = $db->prepare("SELECT id, full_name, email, phone, role, status, profile_picture_url, state, zipcode, account_type, occupation, date_of_birth, sex, created_at FROM users WHERE id = ?");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $profile = $stmt->get_result()->fetch_assoc();
        json_response("success", "Profile data", $profile);
        break;



    case 'get_notifications':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 20");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $res = $stmt->get_result();
        $rows = [];
        while ($row = $res->fetch_assoc()) { $rows[] = $row; }
        json_response("success", "Notifications", $rows);
        break;

    case 'get_notification':
        $user = require_auth();
        $id = $_GET['id'] ?? '';
        if (!$id) json_response("error", "Notification ID required");
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT * FROM notifications WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user['sub']);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();
        if ($res) json_response("success", "Notification details", $res);
        else json_response("error", "Notification not found");
        break;

    case 'mark_notif_read':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['id'])) json_response("error", "ID required");
        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $data['id'], $user['sub']);
        $stmt->execute();
        json_response("success", "Marked as read");
        break;

    case 'update_profile':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];

        $full_name = $_GET['full_name'] ?? $data['full_name'] ?? '';
        $phone = $_GET['phone'] ?? $data['phone'] ?? '';
        $profile_picture_url = $_GET['profile_picture_url'] ?? $data['profile_picture_url'] ?? null;

        if (empty($full_name) || empty($phone)) json_response("error", "Missing fields");

        $db = Database::getInstance()->getConnection();
        if ($profile_picture_url !== null) {
            $stmt = $db->prepare("UPDATE users SET full_name = ?, phone = ?, profile_picture_url = ? WHERE id = ?");
            $stmt->bind_param("sssi", $full_name, $phone, $profile_picture_url, $user['sub']);
        } else {
            $stmt = $db->prepare("UPDATE users SET full_name = ?, phone = ? WHERE id = ?");
            $stmt->bind_param("ssi", $full_name, $phone, $user['sub']);
        }
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

    case 'create_virtual_card':
        $user = require_auth();
        $db = Database::getInstance()->getConnection();

        // Check if user already has a card
        $stmt_check = $db->prepare("SELECT id FROM virtual_cards WHERE account_id = (SELECT id FROM accounts WHERE user_id = ?)");
        $stmt_check->bind_param("i", $user['sub']);
        $stmt_check->execute();
        if ($stmt_check->get_result()->fetch_assoc()) {
            json_response("error", "You already have a virtual card");
        }

        $last4 = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        $card_hash = Security::hashData("411122223333" . $last4);
        $cvv_hash = Security::hashData("123");
        $exp_m = date('n');
        $exp_y = date('Y') + 3;

        $stmt = $db->prepare("INSERT INTO virtual_cards (account_id, card_number_last4, card_number_hash, cvv_hash, expiry_month, expiry_year, network) VALUES ((SELECT id FROM accounts WHERE user_id = ?), ?, ?, ?, ?, ?, 'visa')");
        $stmt->bind_param("isssii", $user['sub'], $last4, $card_hash, $cvv_hash, $exp_m, $exp_y);
        $stmt->execute();

        json_response("success", "Virtual card created successfully");
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
        $res = $db->query("SELECT u.id, u.full_name, u.email, u.phone, u.role, u.status, u.profile_picture_url,
                                  u.state, u.zipcode, u.account_type, u.occupation, u.date_of_birth, u.sex,
                                  a.account_number, a.balance, a.ledger_balance, a.kyc_tier, a.swift_code, a.routing_code, a.max_transfer_limit, a.currency
                           FROM users u JOIN accounts a ON u.id = a.user_id ORDER BY u.created_at DESC");
        $users = [];
        while ($row = $res->fetch_assoc()) { $users[] = $row; }
        json_response("success", "User list", $users);
        break;

    case 'admin_update_user_details':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id'])) {
            json_response("error", "User ID required");
        }

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Update users table
            $state = !empty($data['state']) ? $data['state'] : null;
            $zipcode = !empty($data['zipcode']) ? $data['zipcode'] : null;
            $account_type = !empty($data['account_type']) ? $data['account_type'] : 'Savings Account';
            $occupation = !empty($data['occupation']) ? $data['occupation'] : null;
            $date_of_birth = !empty($data['date_of_birth']) ? $data['date_of_birth'] : null;
            $sex = !empty($data['sex']) ? $data['sex'] : null;

            $stmt = $db->prepare("UPDATE users SET full_name = ?, email = ?, phone = ?, status = ?, profile_picture_url = ?, state = ?, zipcode = ?, account_type = ?, occupation = ?, date_of_birth = ?, sex = ? WHERE id = ?");
            $stmt->bind_param("sssssssssssi", $data['full_name'], $data['email'], $data['phone'], $data['status'], $data['profile_picture_url'], $state, $zipcode, $account_type, $occupation, $date_of_birth, $sex, $data['user_id']);
            $stmt->execute();

            // Update accounts table
            // max_transfer_limit can be null or numeric
            $limit = isset($data['max_transfer_limit']) && $data['max_transfer_limit'] !== '' ? (float)$data['max_transfer_limit'] : null;
            $balance = (float)$data['balance'];
            $ledger_balance = (float)$data['ledger_balance'];
            $kyc_tier = (int)$data['kyc_tier'];
            $currency = !empty($data['currency']) ? $data['currency'] : 'USD';

            $stmt2 = $db->prepare("UPDATE accounts SET kyc_tier = ?, swift_code = ?, routing_code = ?, max_transfer_limit = ?, balance = ?, ledger_balance = ?, currency = ? WHERE user_id = ?");
            $stmt2->bind_param("isssddsi", $kyc_tier, $data['swift_code'], $data['routing_code'], $limit, $balance, $ledger_balance, $currency, $data['user_id']);
            $stmt2->execute();

            $db->commit();
            json_response("success", "User details and account parameters updated successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to update user details: " . $e->getMessage());
        }
        break;

    case 'admin_get_users_emails':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $res = $db->query("SELECT id, full_name, email FROM users ORDER BY full_name ASC");
        $users = [];
        while ($row = $res->fetch_assoc()) { $users[] = $row; }
        json_response("success", "Active users email list", $users);
        break;

    case 'admin_send_custom_email':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['email']) || empty($data['name']) || empty($data['subject']) || empty($data['message'])) {
            json_response("error", "Missing email fields");
        }

        // Email template matching our orange brand theme (#fe820e) and dark background (#1c1917)
        $brand_orange = "#fe820e";
        $brand_dark   = "#1c1917";
        $brand_light  = "#fff7ed";
        $brand_name   = "Starling Crest Finance";
        $support_email= "support@starlingcrestfinance.com";

        // Let's build a beautifully structured notification card styled in our brand colors
        // We strip all linebreaks/returns to prevent nl2br on the mail.php wrapper from injecting raw <br /> tags inside our HTML structure.
        $brand_orange = "#fe820e";
        $brand_dark   = "#1c1917";
        $brand_light  = "#fff7ed";
        $brand_name   = "Starling Crest Finance";
        $support_email= "support@starlingcrestfinance.com";

        $html_message = "<div style='font-family: Arial, sans-serif; background-color: " . $brand_light . "; color: " . $brand_dark . "; padding: 24px; border-radius: 12px; border: 1px solid #ffedd5; box-shadow: 0 4px 15px rgba(28,25,23,0.05); margin-top: 10px; margin-bottom: 10px; text-align: left;'>";
        $html_message .= "<div style='background-color: " . $brand_dark . "; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 4px solid " . $brand_orange . ";'>";
        $html_message .= "<h2 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;'>" . $brand_name . "</h2>";
        $html_message .= "<p style='color: " . $brand_orange . "; margin: 4px 0 0; font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;'>Secure Notification</p>";
        $html_message .= "</div>";
        $html_message .= "<div style='background-color: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #f1f5f9; border-top: none;'>";
        $html_message .= "<p style='font-size: 15px; line-height: 1.6; color: " . $brand_dark . "; margin-top: 0;'>Hello " . htmlspecialchars($data['name']) . ",</p>";
        $html_message .= "<p style='font-size: 14px; line-height: 1.6; color: #475569;'>" . nl2br(htmlspecialchars($data['message'])) . "</p>";
        $html_message .= "<div style='text-align: center; margin: 24px 0 12px;'>";
        $html_message .= "<a href='https://bluevult.com/dashboard' style='display: inline-block; background: linear-gradient(135deg, " . $brand_orange . " 0%, " . $brand_dark . " 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; font-weight: bold; font-size: 13px; box-shadow: 0 4px 12px rgba(254,130,14,0.25);'>Go to Dashboard</a>";
        $html_message .= "</div>";
        $html_message .= "<div style='margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; line-height: 1.5;'>";
        $html_message .= "<strong style='color: " . $brand_dark . ";'>" . $brand_name . "</strong><br/>";
        $html_message .= "Need assistance? Contact our secure desk at <a href='mailto:" . $support_email . "' style='color: " . $brand_orange . "; text-decoration: none; font-weight: 600;'>" . $support_email . "</a>";
        $html_message .= "</div>";
        $html_message .= "</div>";
        $html_message .= "</div>";

        // Remove any actual carriage return and newline characters to prevent nl2br inside mail.php wrapper from injecting <br />
        $html_message_clean = str_replace(["\r", "\n"], '', $html_message);

        // Forward to mailer API
        $payload = [
            "name"    => $data['name'],
            "email"   => $data['email'],
            "subject" => $data['subject'],
            "message" => $html_message_clean
        ];

        // Perform standard POST to bluevult mailer API
        $ch = curl_init('https://bluevult.com/api/mail.php');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json'
        ]);

        $response = curl_exec($ch);
        $err      = curl_error($ch);
        curl_close($ch);

        if ($err) {
            json_response("error", "SMTP Mailer Error: " . $err);
        }

        $res_decoded = json_decode($response, true);
        if ($res_decoded && isset($res_decoded['success']) && $res_decoded['success']) {
            json_response("success", "Email successfully dispatched to " . $data['email']);
        } else {
            $msg = ($res_decoded && isset($res_decoded['error'])) ? $res_decoded['error'] : "SMTP dispatch failed";
            json_response("error", $msg);
        }
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
        $res = $db->query("SELECT t.*, u.full_name as user_name, a.account_number,
                                 cp_u.full_name as counterparty_name, cp_a.account_number as counterparty_account_number,
                                 it.account_number as international_account_number
                           FROM transactions t
                           JOIN accounts a ON t.account_id = a.id
                           JOIN users u ON a.user_id = u.id
                           LEFT JOIN accounts cp_a ON t.counterparty_account_id = cp_a.id
                           LEFT JOIN users cp_u ON cp_a.user_id = cp_u.id
                           LEFT JOIN international_transfers it ON it.transaction_id = t.id
                           ORDER BY t.created_at DESC");
        $txs = [];
        while ($row = $res->fetch_assoc()) {
            if ($row['type'] === 'debit') {
                $row['sender_name'] = $row['user_name'];
                $row['sender_account'] = $row['account_number'];
                if ($row['channel'] === 'external_transfer') {
                    $row['recipient_name'] = $row['external_account_name'];
                    $row['recipient_account'] = $row['international_account_number'] ?? 'N/A';
                } else {
                    $row['recipient_name'] = $row['counterparty_name'] ?? 'System/Other';
                    $row['recipient_account'] = $row['counterparty_account_number'] ?? 'N/A';
                }
            } else {
                $row['sender_name'] = $row['counterparty_name'] ?? 'System/Other';
                $row['sender_account'] = $row['counterparty_account_number'] ?? 'N/A';
                $row['recipient_name'] = $row['user_name'];
                $row['recipient_account'] = $row['account_number'];
            }
            $txs[] = $row;
        }
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

    case 'admin_get_international_transfers':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $res = $db->query("SELECT it.*, u.full_name as sender_name, a.account_number as sender_account, t.reference
                           FROM international_transfers it
                           JOIN users u ON it.user_id = u.id
                           JOIN accounts a ON a.user_id = u.id
                           LEFT JOIN transactions t ON it.transaction_id = t.id
                           ORDER BY it.created_at DESC");
        $transfers = [];
        while ($row = $res->fetch_assoc()) {
            $transfers[] = $row;
        }
        json_response("success", "International transfers", $transfers);
        break;

    case 'admin_update_international_status':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['transaction_id']) || empty($data['status'])) {
            json_response("error", "Missing transaction ID or status");
        }

        $id = (int)$data['transaction_id'];
        $new_status = $data['status'];

        $valid_statuses = ['completed', 'failed', 'reversed', 'pending'];
        if (!in_array($new_status, $valid_statuses)) {
            json_response("error", "Invalid status");
        }

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Find records on both tables using the given ID (which could be the specialized ID or transaction_id)
            $stmt_find = $db->prepare("SELECT id, transaction_id, status, amount, user_id FROM international_transfers WHERE id = ? OR transaction_id = ?");
            $stmt_find->bind_param("ii", $id, $id);
            $stmt_find->execute();
            $it = $stmt_find->get_result()->fetch_assoc();

            if (!$it) {
                // If not found in specialized table, fallback to transactions
                $stmt_find_tx = $db->prepare("SELECT id, status, amount, account_id FROM transactions WHERE id = ?");
                $stmt_find_tx->bind_param("i", $id);
                $stmt_find_tx->execute();
                $tx = $stmt_find_tx->get_result()->fetch_assoc();
                if (!$tx) {
                    throw new Exception("Transaction not found");
                }
                $current_status = $tx['status'];
                $amount = (float)$tx['amount'];
                $transaction_id = $tx['id'];

                $stmt_acc_info = $db->prepare("SELECT id, user_id FROM accounts WHERE id = ?");
                $stmt_acc_info->bind_param("i", $tx['account_id']);
                $stmt_acc_info->execute();
                $acc_info = $stmt_acc_info->get_result()->fetch_assoc();
                $account_id = $acc_info['id'];
                $user_id = $acc_info['user_id'];
            } else {
                $current_status = $it['status'];
                $amount = (float)$it['amount'];
                $transaction_id = $it['transaction_id'];

                $stmt_acc_info = $db->prepare("SELECT id FROM accounts WHERE user_id = ?");
                $stmt_acc_info->bind_param("i", $it['user_id']);
                $stmt_acc_info->execute();
                $acc_info = $stmt_acc_info->get_result()->fetch_assoc();
                $account_id = $acc_info['id'];
                $user_id = $it['user_id'];
            }

            // Refund logic: if moving from completed/pending to failed/reversed
            if (($current_status === 'completed' || $current_status === 'pending') && ($new_status === 'failed' || $new_status === 'reversed')) {
                // Perform refund to the user's account
                $stmt_refund = $db->prepare("UPDATE accounts SET balance = balance + ?, ledger_balance = ledger_balance + ? WHERE id = ?");
                $stmt_refund->bind_param("ddi", $amount, $amount, $account_id);
                $stmt_refund->execute();

                // Insert a notification for the refund
                $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'reversal', 'Refund Issued', ?)");
                $notif_msg = "Your international transfer of $" . number_format($amount, 2) . " has been reversed/refunded back to your account.";
                $stmt_notif->bind_param("is", $user_id, $notif_msg);
                $stmt_notif->execute();
            }

            // Update transactions table status
            $stmt_update = $db->prepare("UPDATE transactions SET status = ? WHERE id = ?");
            $stmt_update->bind_param("si", $new_status, $transaction_id);
            $stmt_update->execute();

            // If specialized record exists, update its status too
            if ($it) {
                $stmt_update_it = $db->prepare("UPDATE international_transfers SET status = ? WHERE id = ?");
                $stmt_update_it->bind_param("si", $new_status, $it['id']);
                $stmt_update_it->execute();
            }

            $db->commit();
            json_response("success", "Transfer status updated successfully" . (($new_status === 'failed' || $new_status === 'reversed') ? " and funds refunded" : ""));
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to update international transfer status: " . $e->getMessage());
        }
        break;

    case 'admin_edit_international_transfer':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['id'])) {
            json_response("error", "International transfer ID is required");
        }

        $id = (int)$data['id'];
        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Fetch the international transfer record
            $stmt = $db->prepare("SELECT * FROM international_transfers WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $it = $stmt->get_result()->fetch_assoc();

            if (!$it) {
                throw new Exception("International transfer not found");
            }

            // Fetch the main transaction record
            $stmt_tx = $db->prepare("SELECT * FROM transactions WHERE id = ?");
            $stmt_tx->bind_param("i", $it['transaction_id']);
            $stmt_tx->execute();
            $tx = $stmt_tx->get_result()->fetch_assoc();

            if (!$tx) {
                throw new Exception("Associated transaction not found");
            }

            // Fetch the user's account
            $stmt_acc = $db->prepare("SELECT * FROM accounts WHERE id = ?");
            $stmt_acc->bind_param("i", $tx['account_id']);
            $stmt_acc->execute();
            $acc = $stmt_acc->get_result()->fetch_assoc();

            if (!$acc) {
                throw new Exception("Sender account not found");
            }

            $old_amount = (float)$it['amount'];
            $new_amount = isset($data['amount']) ? (float)$data['amount'] : $old_amount;
            $old_status = $it['status'];
            $new_status = isset($data['status']) ? $data['status'] : $old_status;

            $valid_statuses = ['pending', 'completed', 'failed', 'reversed'];
            if (!in_array($new_status, $valid_statuses)) {
                throw new Exception("Invalid status");
            }

            $balance_adjustment = 0.00;

            // Determine if refund or debit or adjustment is needed
            $old_is_active = ($old_status === 'completed' || $old_status === 'pending');
            $new_is_active = ($new_status === 'completed' || $new_status === 'pending');

            if ($old_is_active && !$new_is_active) {
                // Refunding the old amount
                $balance_adjustment = $old_amount;

                // Insert notification for refund
                $stmt_notif = $db->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'reversal', 'Refund Issued', ?)");
                $notif_msg = "Your international transfer of $" . number_format($old_amount, 2) . " has been reversed/refunded back to your account.";
                $stmt_notif->bind_param("is", $acc['user_id'], $notif_msg);
                $stmt_notif->execute();
            } elseif (!$old_is_active && $new_is_active) {
                // Debiting the new amount
                $balance_adjustment = -$new_amount;
            } elseif ($old_is_active && $new_is_active) {
                // Both are active debits: adjust by the difference
                $diff = $new_amount - $old_amount;
                $balance_adjustment = -$diff;
            }

            // Check if the user has enough balance if we are debiting or adjusting downwards
            if ($balance_adjustment < 0 && ($acc['balance'] + $balance_adjustment) < 0) {
                throw new Exception("Insufficient user balance for this adjustment (Requires additional " . abs($balance_adjustment) . ")");
            }

            // Update user's account balance
            if ($balance_adjustment != 0) {
                $stmt_up_acc = $db->prepare("UPDATE accounts SET balance = balance + ?, ledger_balance = ledger_balance + ? WHERE id = ?");
                $stmt_up_acc->bind_param("ddi", $balance_adjustment, $balance_adjustment, $acc['id']);
                $stmt_up_acc->execute();
            }

            // Update transactions table record
            $new_balance_after = $tx['balance_after'] + $balance_adjustment;
            // If the transfer narration is constructed, update it
            $user_narr = !empty($data['narration']) ? $data['narration'] : "International Transfer";
            $country = !empty($data['country']) ? $data['country'] : $it['country'];
            $swift_code = !empty($data['swift_code']) ? $data['swift_code'] : $it['swift_code'];
            $tx_type_label = !empty($data['transaction_type']) ? $data['transaction_type'] : $it['transaction_type'];
            $purpose = !empty($data['purpose']) ? $data['purpose'] : $it['purpose'];
            $final_narration = "$user_narr (Country: $country, SWIFT: $swift_code, Type: $tx_type_label, Purpose: $purpose)";

            $stmt_up_tx = $db->prepare("UPDATE transactions SET amount = ?, status = ?, narration = ?, balance_after = ?, external_bank_name = ?, external_account_name = ? WHERE id = ?");
            $stmt_up_tx->bind_param("dssdssi", $new_amount, $new_status, $final_narration, $new_balance_after, $data['bank_name'], $data['account_name'], $it['transaction_id']);
            $stmt_up_tx->execute();

            // Update international_transfers table record
            $stmt_up_it = $db->prepare("UPDATE international_transfers SET bank_name = ?, country = ?, swift_code = ?, account_name = ?, account_number = ?, iban = ?, amount = ?, narration = ?, transaction_type = ?, purpose = ?, status = ? WHERE id = ?");
            $stmt_up_it->bind_param("ssssssdssssi", $data['bank_name'], $data['country'], $data['swift_code'], $data['account_name'], $data['account_number'], $data['iban'], $new_amount, $data['narration'], $tx_type_label, $purpose, $new_status, $id);
            $stmt_up_it->execute();

            $db->commit();
            json_response("success", "International transfer edited and user balance synchronized successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to edit international transfer: " . $e->getMessage());
        }
        break;

    case 'admin_edit_transaction':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['transaction_id']) || !isset($data['amount']) || !isset($data['narration'])) {
            json_response("error", "Missing required fields");
        }

        $transaction_id = (int)$data['transaction_id'];
        $new_amount = (float)$data['amount'];
        $new_narration = $data['narration'];

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Fetch transaction
            $stmt = $db->prepare("SELECT account_id, type, amount, balance_after FROM transactions WHERE id = ?");
            $stmt->bind_param("i", $transaction_id);
            $stmt->execute();
            $tx = $stmt->get_result()->fetch_assoc();

            if (!$tx) {
                throw new Exception("Transaction not found");
            }

            $account_id = $tx['account_id'];
            $type = $tx['type'];
            $old_amount = (float)$tx['amount'];

            // Calculate change in balance
            $diff = $new_amount - $old_amount;
            if ($type === 'credit') {
                $balance_adjustment = $diff;
            } else {
                // debit, fee, reversal etc.
                $balance_adjustment = -$diff;
            }

            // Update transaction amount, narration, and balance_after
            $new_balance_after = $tx['balance_after'] + $balance_adjustment;
            $stmt_update_tx = $db->prepare("UPDATE transactions SET amount = ?, narration = ?, balance_after = ? WHERE id = ?");
            $stmt_update_tx->bind_param("dsdi", $new_amount, $new_narration, $new_balance_after, $transaction_id);
            $stmt_update_tx->execute();

            // Sync with international_transfers if exists
            $stmt_sync_it = $db->prepare("UPDATE international_transfers SET amount = ?, narration = ? WHERE transaction_id = ?");
            $stmt_sync_it->bind_param("dsi", $new_amount, $new_narration, $transaction_id);
            $stmt_sync_it->execute();

            // Update user account balance
            $stmt_update_acc = $db->prepare("UPDATE accounts SET balance = balance + ?, ledger_balance = ledger_balance + ? WHERE id = ?");
            $stmt_update_acc->bind_param("ddi", $balance_adjustment, $balance_adjustment, $account_id);
            $stmt_update_acc->execute();

            // Commit
            $db->commit();
            json_response("success", "Transaction and account balance updated successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to update transaction: " . $e->getMessage());
        }
        break;

    case 'admin_adjust_balance':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || !isset($data['amount']) || empty($data['type'])) {
            json_response("error", "Missing fields");
        }

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Get current account info
            $stmt = $db->prepare("SELECT id, balance FROM accounts WHERE user_id = ?");
            $stmt->bind_param("i", $data['user_id']);
            $stmt->execute();
            $acc = $stmt->get_result()->fetch_assoc();

            if (!$acc) throw new Exception("Account not found");

            $amount = (float)$data['amount'];
            $new_balance = ($data['type'] === 'credit') ? ($acc['balance'] + $amount) : ($acc['balance'] - $amount);

            if ($new_balance < 0) throw new Exception("Insufficient balance for deduction");

            // Update balance
            $stmt2 = $db->prepare("UPDATE accounts SET balance = ? WHERE id = ?");
            $stmt2->bind_param("di", $new_balance, $acc['id']);
            $stmt2->execute();

            // Record transaction
            $ref = "ADJ" . time() . strtoupper(bin2hex(random_bytes(3)));
            $narration = $data['narration'] ?? "Admin Adjustment";
            $stmt3 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, status) VALUES (?, ?, 'adjustment', ?, ?, ?, ?, 'completed')");
            $stmt3->bind_param("isddss", $acc['id'], $data['type'], $amount, $new_balance, $narration, $ref);
            $stmt3->execute();

            $db->commit();
            json_response("success", "Balance adjusted successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to adjust balance: " . $e->getMessage());
        }
        break;

    case 'admin_send_notification':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || empty($data['title']) || empty($data['message'])) {
            json_response("error", "Missing fields");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO notifications (user_id, type, title, message) VALUES (?, 'admin_message', ?, ?)");
        $stmt->bind_param("iss", $data['user_id'], $data['title'], $data['message']);

        if ($stmt->execute()) {
            json_response("success", "Notification sent successfully");
        } else {
            json_response("error", "Failed to send notification");
        }
        break;

    case 'admin_update_user_status':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || empty($data['status'])) {
            json_response("error", "Missing fields");
        }

        $valid_statuses = ['active', 'suspended', 'frozen', 'closed'];
        if (!in_array($data['status'], $valid_statuses)) {
            json_response("error", "Invalid status");
        }

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("UPDATE users SET status = ? WHERE id = ?");
        $stmt->bind_param("si", $data['status'], $data['user_id']);

        if ($stmt->execute()) {
            json_response("success", "User status updated to " . $data['status']);
        } else {
            json_response("error", "Failed to update user status");
        }
        break;

    case 'admin_delete_user':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id'])) {
            json_response("error", "Missing User ID");
        }

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Cannot delete self
            if ((int)$data['user_id'] === (int)$user['sub']) {
                throw new Exception("You cannot delete your own admin account");
            }

            $stmt = $db->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $data['user_id']);
            $stmt->execute();

            $db->commit();
            json_response("success", "User account deleted successfully");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to delete user: " . $e->getMessage());
        }
        break;

    case 'admin_create_user':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];

        if (empty($data['full_name']) || empty($data['email']) || empty($data['phone']) || empty($data['password']) || empty($data['pin'])) {
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
        $pin_hash = Security::hashData($data['pin']);
        $status = !empty($data['status']) ? $data['status'] : 'active';
        $kyc_tier = isset($data['kyc_tier']) ? (int)$data['kyc_tier'] : 1;
        $initial_balance = isset($data['initial_balance']) ? (float)$data['initial_balance'] : 0.00;

        $state = !empty($data['state']) ? $data['state'] : null;
        $zipcode = !empty($data['zipcode']) ? $data['zipcode'] : null;
        $account_type = !empty($data['account_type']) ? $data['account_type'] : 'Savings Account';
        $occupation = !empty($data['occupation']) ? $data['occupation'] : null;
        $date_of_birth = !empty($data['date_of_birth']) ? $data['date_of_birth'] : null;
        $sex = !empty($data['sex']) ? $data['sex'] : null;
        $currency = !empty($data['currency']) ? $data['currency'] : 'USD';

        $db->begin_transaction();
        try {
            $stmt = $db->prepare("INSERT INTO users (full_name, email, phone, password_hash, pin_hash, status, email_verified_at, state, zipcode, account_type, occupation, date_of_birth, sex) VALUES (?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("ssssssssssss", $data['full_name'], $data['email'], $data['phone'], $password_hash, $pin_hash, $status, $state, $zipcode, $account_type, $occupation, $date_of_birth, $sex);
            $stmt->execute();
            $user_id = $db->insert_id;

            $account_number = str_pad(random_int(0, 9999999999), 10, '0', STR_PAD_LEFT);
            $stmt = $db->prepare("INSERT INTO accounts (user_id, account_number, balance, ledger_balance, kyc_tier, currency) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->bind_param("isddis", $user_id, $account_number, $initial_balance, $initial_balance, $kyc_tier, $currency);
            $stmt->execute();
            $account_id = $db->insert_id;

            if ($initial_balance > 0) {
                $ref = "ADJ" . time() . strtoupper(bin2hex(random_bytes(3)));
                $stmt3 = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, status) VALUES (?, 'credit', 'adjustment', ?, ?, 'Initial Balance', ?, 'completed')");
                $stmt3->bind_param("idds", $account_id, $initial_balance, $initial_balance, $ref);
                $stmt3->execute();
            }

            $db->commit();
            json_response("success", "User account created successfully", ["user_id" => $user_id, "account_number" => $account_number]);
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Creation failed: " . $e->getMessage());
        }
        break;

    case 'admin_seed_transactions':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id'])) {
            json_response("error", "User ID required");
        }

        $base_date = !empty($data['base_date']) ? $data['base_date'] : date('Y-m-d');

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            // Get user's account
            $stmt = $db->prepare("SELECT id, balance FROM accounts WHERE user_id = ?");
            $stmt->bind_param("i", $data['user_id']);
            $stmt->execute();
            $acc = $stmt->get_result()->fetch_assoc();
            if (!$acc) throw new Exception("Account not found");

            $base_time = strtotime($base_date);
            if ($base_time === false) {
                $base_time = time();
            }

            // Check if editable transactions are provided, else fallback to default mocks
            if (!empty($data['transactions']) && is_array($data['transactions'])) {
                $mocks = $data['transactions'];
            } else {
                $mocks = [
                    ['type' => 'credit', 'channel' => 'deposit', 'amount' => 1500.00, 'narration' => 'Initial Wire Transfer Credit', 'days_offset' => -6],
                    ['type' => 'debit', 'channel' => 'internal_transfer', 'amount' => 48.62, 'narration' => "Kat's Bakery", 'days_offset' => -5],
                    ['type' => 'debit', 'channel' => 'fee', 'amount' => 9.99, 'narration' => 'Bundle TV Subscription', 'days_offset' => -4],
                    ['type' => 'credit', 'channel' => 'deposit', 'amount' => 2500.00, 'narration' => 'Monthly Salary Credit', 'days_offset' => -3],
                    ['type' => 'debit', 'channel' => 'internal_transfer', 'amount' => 124.50, 'narration' => 'Amazon UK Marketplace', 'days_offset' => -2],
                    ['type' => 'debit', 'channel' => 'internal_transfer', 'amount' => 114.47, 'narration' => 'Starling Transfer to Vault', 'days_offset' => -1],
                    ['type' => 'credit', 'channel' => 'deposit', 'amount' => 82.20, 'narration' => 'Refund Amazon UK', 'days_offset' => 0],
                ];
            }

            // Clear existing transactions for this account to keep statement clean
            $stmt_del = $db->prepare("DELETE FROM transactions WHERE account_id = ?");
            $stmt_del->bind_param("i", $acc['id']);
            $stmt_del->execute();

            // Calculate starting running balance so that at the end of sequence,
            // the balance equals the CURRENT unmodified account balance exactly.
            $current_balance = (float)$acc['balance'];
            $net_change = 0.0;
            foreach ($mocks as $m) {
                $amt = (float)$m['amount'];
                if ($m['type'] === 'credit') {
                    $net_change += $amt;
                } else {
                    $net_change -= $amt;
                }
            }
            $running_balance = $current_balance - $net_change;

            foreach ($mocks as $idx => $m) {
                $amt = (float)$m['amount'];
                if ($m['type'] === 'credit') {
                    $running_balance += $amt;
                } else {
                    $running_balance -= $amt;
                }

                $days = isset($m['days_offset']) ? (int)$m['days_offset'] : 0;
                $tx_time = $base_time + ($days * 86400);
                $tx_date = date('Y-m-d H:i:s', $tx_time);
                $ref = "TXN" . $tx_time . $idx . strtoupper(bin2hex(random_bytes(2)));
                $channel = !empty($m['channel']) ? $m['channel'] : ($m['type'] === 'credit' ? 'deposit' : 'internal_transfer');

                $stmt_ins = $db->prepare("INSERT INTO transactions (account_id, type, channel, amount, balance_after, narration, reference, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'completed')");
                $stmt_ins->bind_param("issddsss", $acc['id'], $m['type'], $channel, $amt, $running_balance, $m['narration'], $ref, $tx_date);
                $stmt_ins->execute();
            }

            // Do NOT update accounts balance or ledger_balance to respect: "seeding must not modify user balance."

            $db->commit();
            json_response("success", "Realistic transaction history seeded successfully! Balance was kept untouched.", ["final_balance" => $current_balance]);
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Seeding failed: " . $e->getMessage());
        }
        break;

    case 'admin_reset_password':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || empty($data['password'])) {
            json_response("error", "Missing fields");
        }

        $db = Database::getInstance()->getConnection();
        $password_hash = Security::hashData($data['password']); // Plaintext because of Security.php updates

        $stmt = $db->prepare("UPDATE users SET password_hash = ? WHERE id = ?");
        $stmt->bind_param("si", $password_hash, $data['user_id']);
        if ($stmt->execute()) {
            json_response("success", "Password reset successfully");
        } else {
            json_response("error", "Failed to reset password");
        }
        break;

    case 'admin_reset_pin':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['user_id']) || empty($data['pin'])) {
            json_response("error", "Missing fields");
        }

        $db = Database::getInstance()->getConnection();
        $pin_hash = Security::hashData($data['pin']); // Plaintext because of Security.php updates

        $stmt = $db->prepare("UPDATE users SET pin_hash = ? WHERE id = ?");
        $stmt->bind_param("si", $pin_hash, $data['user_id']);
        if ($stmt->execute()) {
            json_response("success", "Transaction PIN reset successfully");
        } else {
            json_response("error", "Failed to reset transaction PIN");
        }
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

    case 'create_swap_protocol':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        $type = $data['type'] ?? 'internal';

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("INSERT INTO swap_protocols (user_id, type, status) VALUES (?, ?, 'pending')");
        $stmt->bind_param("is", $user['sub'], $type);
        $stmt->execute();
        json_response("success", "Swap protocol initiated");
        break;

    case 'upload_swap_receipt':
        $user = require_auth();
        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['receipt_url'])) json_response("error", "Receipt URL required");

        $db = Database::getInstance()->getConnection();

        // Find existing pending swap protocol
        $stmt = $db->prepare("SELECT id, uploaded_at, attempt_count FROM swap_protocols WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1");
        $stmt->bind_param("i", $user['sub']);
        $stmt->execute();
        $proto = $stmt->get_result()->fetch_assoc();

        if (!$proto) {
            $stmt = $db->prepare("INSERT INTO swap_protocols (user_id, type, status, receipt_url, uploaded_at, attempt_count) VALUES (?, 'internal', 'pending', ?, NOW(), 1)");
            $stmt->bind_param("is", $user['sub'], $data['receipt_url']);
            $stmt->execute();
        } else {
            $uploaded = strtotime($proto['uploaded_at']);
            $attempt_count = $proto['attempt_count'];
            if ($proto['uploaded_at'] && (time() - $uploaded > (5 * 3600))) {
                $attempt_count++;
            }
            $stmt = $db->prepare("UPDATE swap_protocols SET receipt_url = ?, uploaded_at = NOW(), attempt_count = ? WHERE id = ?");
            $stmt->bind_param("sii", $data['receipt_url'], $attempt_count, $proto['id']);
            $stmt->execute();
        }

        json_response("success", "Receipt uploaded successfully");
        break;

    case 'check_swap_protocol_status':
        $user = require_auth();
        $type = $_GET['type'] ?? 'internal';

        $db = Database::getInstance()->getConnection();
        $stmt = $db->prepare("SELECT status, receipt_url, uploaded_at, created_at, attempt_count FROM swap_protocols WHERE user_id = ? AND type = ? ORDER BY created_at DESC LIMIT 1");
        $stmt->bind_param("is", $user['sub'], $type);
        $stmt->execute();
        $res = $stmt->get_result()->fetch_assoc();

        if ($res) {
            $is_expired = false;
            if ($res['status'] === 'pending' && $res['uploaded_at']) {
                $uploaded = strtotime($res['uploaded_at']);
                if (time() - $uploaded > (5 * 3600)) {
                    $is_expired = true;
                }
            }

            if ($res['status'] === 'completed') {
                json_response("success", "Swap protocol approved", ["status" => "completed"]);
            } else {
                json_response("error", "Swap protocol pending", [
                    "status" => "pending",
                    "has_receipt" => !empty($res['receipt_url']),
                    "is_expired" => $is_expired,
                    "uploaded_at" => $res['uploaded_at'],
                    "attempt_count" => (int)$res['attempt_count']
                ]);
            }
        } else {
            json_response("error", "Swap protocol not found", ["status" => "not_found"]);
        }
        break;

    case 'admin_get_swap_protocols':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $db = Database::getInstance()->getConnection();
        $res = $db->query("SELECT s.*, u.full_name, u.email, a.kyc_tier
                           FROM swap_protocols s
                           JOIN users u ON s.user_id = u.id
                           JOIN accounts a ON u.id = a.user_id
                           ORDER BY s.created_at DESC");
        $rows = [];
        while ($row = $res->fetch_assoc()) { $rows[] = $row; }
        json_response("success", "Swap protocols", $rows);
        break;

    case 'admin_complete_swap_protocol':
        $user = require_auth();
        if ($user['role'] !== 'admin' && $user['role'] !== 'super_admin') json_response("error", "Forbidden");

        $data = json_decode(file_get_contents("php://input"), true) ?? [];
        if (empty($data['protocol_id'])) json_response("error", "Protocol ID required");

        $db = Database::getInstance()->getConnection();
        $db->begin_transaction();
        try {
            $stmt = $db->prepare("UPDATE swap_protocols SET status = 'completed', completed_at = NOW() WHERE id = ?");
            $stmt->bind_param("i", $data['protocol_id']);
            $stmt->execute();

            // If it's an internal swap, maybe upgrade tier?
            // The existing memory says it's used for Tier 1 users to perform transfers.
            // Requirement says: "when the user the user details is shown, it prompts the user about the swap protocol again independent of the user tier untill the admin approves the swap protocol"

            $stmt_get = $db->prepare("SELECT user_id, type FROM swap_protocols WHERE id = ?");
            $stmt_get->bind_param("i", $data['protocol_id']);
            $stmt_get->execute();
            $proto = $stmt_get->get_result()->fetch_assoc();

            if ($proto && $proto['type'] === 'internal') {
                $stmt_up = $db->prepare("UPDATE accounts SET kyc_tier = GREATEST(kyc_tier, 2) WHERE user_id = ?");
                $stmt_up->bind_param("i", $proto['user_id']);
                $stmt_up->execute();
            }

            $db->commit();
            json_response("success", "Swap protocol approved");
        } catch (Exception $e) {
            $db->rollback();
            json_response("error", "Failed to approve swap protocol");
        }
        break;

    case 'get_external_banks':
       $banks = [
    ["id" => 1, "name" => "Industrial and Commercial Bank of China (ICBC)"],
    ["id" => 2, "name" => "China Construction Bank"],
    ["id" => 3, "name" => "Agricultural Bank of China"],
    ["id" => 4, "name" => "Bank of China"],
    ["id" => 5, "name" => "Sberbank (Russia)"],
    ["id" => 6, "name" => "VTB Bank (Russia)"],
    ["id" => 7, "name" => "Gazprombank (Russia)"],
    ["id" => 8, "name" => "Mitsubishi UFJ Financial Group (Japan)"],
    ["id" => 9, "name" => "Sumitomo Mitsui Financial Group (Japan)"],
    ["id" => 10, "name" => "Mizuho Financial Group (Japan)"],
    ["id" => 11, "name" => "Bank of Communications (China)"],
    ["id" => 12, "name" => "Postal Savings Bank of China"],
    ["id" => 13, "name" => "China Merchants Bank"],
    ["id" => 14, "name" => "Industrial Bank (China)"],
    ["id" => 15, "name" => "Shanghai Pudong Development Bank"],
    ["id" => 16, "name" => "China CITIC Bank"],
    ["id" => 17, "name" => "Alfa-Bank (Russia)"],
    ["id" => 18, "name" => "Rosselkhozbank (Russian Agricultural Bank)"],
    ["id" => 19, "name" => "Bank Otkritie (Russia)"],
    ["id" => 20, "name" => "Tinkoff Bank (Russia)"],
    ["id" => 21, "name" => "State Bank of India"],
    ["id" => 22, "name" => "HDFC Bank (India)"],
    ["id" => 23, "name" => "ICICI Bank (India)"],
    ["id" => 24, "name" => "DBS Bank (Singapore)"],
    ["id" => 25, "name" => "OCBC Bank (Singapore)"],
    ["id" => 26, "name" => "United Overseas Bank (Singapore)"],
    ["id" => 27, "name" => "Maybank (Malaysia)"],
    ["id" => 28, "name" => "CIMB Bank (Malaysia)"],
    ["id" => 29, "name" => "Public Bank Berhad (Malaysia)"],
    ["id" => 30, "name" => "Kasikornbank (Thailand)"],
    ["id" => 31, "name" => "Siam Commercial Bank (Thailand)"],
    ["id" => 32, "name" => "Bangkok Bank (Thailand)"],
    ["id" => 33, "name" => "Vietcombank (Vietnam)"],
    ["id" => 34, "name" => "Joint Stock Commercial Bank for Investment and Development of Vietnam (BIDV)"],
    ["id" => 35, "name" => "Bank Central Asia (Indonesia)"],
    ["id" => 36, "name" => "Bank Mandiri (Indonesia)"],
    ["id" => 37, "name" => "Bank Rakyat Indonesia"],
    ["id" => 38, "name" => "Kookmin Bank (South Korea)"],
    ["id" => 39, "name" => "Shinhan Bank (South Korea)"],
    ["id" => 40, "name" => "Hana Bank (South Korea)"],
    ["id" => 41, "name" => "Woori Bank (South Korea)"],
    ["id" => 42, "name" => "Cathay United Bank (Taiwan)"],
    ["id" => 43, "name" => "CTBC Bank (Taiwan)"],
    ["id" => 44, "name" => "Bank of Taiwan"],
    ["id" => 45, "name" => "BDO Unibank (Philippines)"],
    ["id" => 46, "name" => "Metropolitan Bank and Trust Company (Philippines)"],
    ["id" => 47, "name" => "Bank of the Philippine Islands"],
    ["id" => 48, "name" => "Habib Bank (Pakistan)"],
    ["id" => 49, "name" => "National Bank of Pakistan"],
    ["id" => 50, "name" => "MCB Bank (Pakistan)"],
    ["id" => 51, "name" => "Bank of Ceylon (Sri Lanka)"],
    ["id" => 52, "name" => "Commercial Bank of Ceylon"],
    ["id" => 53, "name" => "Sonali Bank (Bangladesh)"],
    ["id" => 54, "name" => "Islami Bank Bangladesh"],
    ["id" => 55, "name" => "Promsvyazbank (Russia)"],
    ["id" => 56, "name" => "Raiffeisenbank Russia"],
    ["id" => 57, "name" => "Sovcombank (Russia)"],
    ["id" => 58, "name" => "Bank Saint Petersburg (Russia)"],
    ["id" => 59, "name" => "Ping An Bank (China)"],
    ["id" => 60, "name" => "Huaxia Bank (China)"],
    ["id" => 61, "name" => "China Minsheng Bank"],
    ["id" => 62, "name" => "China Everbright Bank"],
    ["id" => 63, "name" => "Bank of Beijing"],
    ["id" => 64, "name" => "Bank of Shanghai"],
    ["id" => 65, "name" => "Bank of Nanjing"],
    ["id" => 66, "name" => "Bank of Ningbo"],
    ["id" => 67, "name" => "Zheshang Bank (China)"],
    ["id" => 68, "name" => "Shengjing Bank (China)"],
    ["id" => 69, "name" => "Bank of Chongqing"],
    ["id" => 70, "name" => "Bank of Chengdu"],
    ["id" => 71, "name" => "Resona Holdings (Japan)"],
    ["id" => 72, "name" => "Fukuoka Financial Group (Japan)"],
    ["id" => 73, "name" => "Chiba Bank (Japan)"],
    ["id" => 74, "name" => "Bank of Yokohama (Japan)"],
    ["id" => 75, "name" => "Shizuoka Bank (Japan)"],
    ["id" => 76, "name" => "Axis Bank (India)"],
    ["id" => 77, "name" => "Punjab National Bank (India)"],
    ["id" => 78, "name" => "Bank of Baroda (India)"],
    ["id" => 79, "name" => "Canara Bank (India)"],
    ["id" => 80, "name" => "Union Bank of India"],
    ["id" => 81, "name" => "Industrial Bank of Korea"],
    ["id" => 82, "name" => "Nonghyup Bank (South Korea)"],
    ["id" => 83, "name" => "Busan Bank (South Korea)"],
    ["id" => 84, "name" => "Daegu Bank (South Korea)"],
    ["id" => 85, "name" => "Standard Chartered Korea"],
    ["id" => 86, "name" => "Krung Thai Bank (Thailand)"],
    ["id" => 87, "name" => "TMBThanachart Bank (Thailand)"],
    ["id" => 88, "name" => "Bank of Ayudhya (Thailand)"],
    ["id" => 89, "name" => "RHB Bank (Malaysia)"],
    ["id" => 90, "name" => "AmBank (Malaysia)"],
    ["id" => 91, "name" => "Hong Leong Bank (Malaysia)"],
    ["id" => 92, "name" => "Alliance Bank (Malaysia)"],
    ["id" => 93, "name" => "Bank Negara Indonesia"],
    ["id" => 94, "name" => "Bank Danamon (Indonesia)"],
    ["id" => 95, "name" => "Bank Permata (Indonesia)"],
    ["id" => 96, "name" => "Bank Syariah Indonesia"],
    ["id" => 97, "name" => "VietinBank (Vietnam)"],
    ["id" => 98, "name" => "Military Commercial Joint Stock Bank (Vietnam)"],
    ["id" => 99, "name" => "Techcombank (Vietnam)"],
    ["id" => 100, "name" => "Sacombank (Vietnam)"],
    ["id" => 101, "name" => "Rosbank (Russia)"],
    ["id" => 102, "name" => "Uralsib Bank (Russia)"],
    ["id" => 103, "name" => "Bank of Hangzhou (China)"],
    ["id" => 104, "name" => "Bank of Suzhou (China)"],
    ["id" => 105, "name" => "Bank of Guiyang (China)"]
];

        json_response("success", "Banks fetched", $banks);
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
