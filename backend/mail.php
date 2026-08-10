<?php
require __DIR__ . '/src/PHPMailer.php';
require __DIR__ . '/src/SMTP.php';
require __DIR__ . '/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ---------------------------------------------------------------------
// ERROR LOGGING
// ---------------------------------------------------------------------
function logError(string $context, string $detail = ''): void {
    error_log("[" . date('Y-m-d H:i:s') . "] $context" . ($detail ? " | $detail" : '') . PHP_EOL, 3, __DIR__ . '/logs/error.log');
}

// ---------------------------------------------------------------------
// DB CONNECTION
// ---------------------------------------------------------------------
require __DIR__ . '/config.php'; // defines DB_HOST, DB_NAME, DB_USER, DB_PASS, SMTP_* constants

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
if ($conn->connect_error) {
    logError("DB connection failed", $conn->connect_error);
    echo json_encode(["status" => "error", "message" => "Internal server error"]);
    exit;
}

// ---------------------------------------------------------------------
// EMAIL SERVICE
// ---------------------------------------------------------------------
class EmailService {
    private static function createMailer(): PHPMailer {
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = SMTP_USER;
        $mail->Password   = SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom($mail->Username, 'StarlingCrest Finance');
        return $mail;
    }

    public static function sendMail($toEmail, $subject, $body): array {
        try {
            $mail = self::createMailer();
            $mail->addAddress($toEmail);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $body;
            $mail->AltBody = strip_tags($body);
            $mail->send();
            return [
                "status" => "success",
                "message" => "Email sent successfully"
            ];
        } catch (Exception $e) {
            logError("Email send failed for recipient: $toEmail", $mail->ErrorInfo ?: $e->getMessage());
            return [
                "status" => "error",
                "message" => $mail->ErrorInfo ?: $e->getMessage()
            ];
        }
    }
}

// ---------------------------------------------------------------------
// OTP LOOKUP
// ---------------------------------------------------------------------
class UserService {
    /**
     * Look up a user's email by their id.
     * Returns the email string or null if not found.
     */
    public static function getEmailById(mysqli $conn, int $userId): ?string {
        $stmt = $conn->prepare("SELECT email FROM users WHERE id = ? LIMIT 1");
        $stmt->bind_param('i', $userId);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row ? $row['email'] : null;
    }
}

class OtpService {
    /**
     * Generate a new 6-digit OTP, invalidate any prior unused OTPs of the
     * same type for this user, insert the new one, and return it.
     */
    public static function generateAndStore(mysqli $conn, int $userId, string $type = 'transfer', int $ttlMinutes = 10): array {
        // Invalidate any existing unused OTPs of this type so only the newest is valid
        $invalidate = $conn->prepare(
            "UPDATE otp_codes SET used_at = UTC_TIMESTAMP()
             WHERE user_id = ? AND type = ? AND used_at IS NULL"
        );
        $invalidate->bind_param('is', $userId, $type);
        $invalidate->execute();
        $invalidate->close();

        // Cryptographically strong 6-digit code, zero-padded
        $code = str_pad((string)random_int(0, 999999), 6, '0', STR_PAD_LEFT);
        $expiresAt = date('Y-m-d H:i:s', strtotime("+{$ttlMinutes} minutes"));

        $insert = $conn->prepare(
            "INSERT INTO otp_codes (user_id, code, type, expires_at, created_at)
             VALUES (?, ?, ?, ?, UTC_TIMESTAMP())"
        );
        $insert->bind_param('isss', $userId, $code, $type, $expiresAt);
        $insert->execute();
        $insert->close();

        return ['code' => $code, 'type' => $type, 'expires_at' => $expiresAt];
    }

    /**
     * Fetch the most recent, unused, non-expired OTP for a given user id.
     * Returns the otp row (assoc array) or null if none found.
     */
    public static function getLatestOtp(mysqli $conn, int $userId, string $type = 'transfer'): ?array {
        $stmt = $conn->prepare(
            "SELECT id, code, type, expires_at
             FROM otp_codes
             WHERE user_id = ?
               AND type = ?
               AND used_at IS NULL
               AND expires_at >= UTC_TIMESTAMP()
             ORDER BY created_at DESC
             LIMIT 1"
        );
        $stmt->bind_param('is', $userId, $type);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        $stmt->close();
        return $row ?: null;
    }

    /**
     * HTML email template for the OTP.
     */
    public static function buildTemplate(string $code): string {
        $safeCode = htmlspecialchars($code, ENT_QUOTES, 'UTF-8');
        return "
        <div style='font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;'>
            <h2 style='color: #050a14;'>StarlingCrest Finance</h2>
            <p style='font-size: 15px; color: #333;'>Use the code below to verify your transaction. This code expires shortly, so use it right away.</p>
            <div style='margin: 24px 0; text-align: center;'>
                <span style='display: inline-block; padding: 14px 28px; font-size: 28px; letter-spacing: 6px; font-weight: bold; background: #f2f2f2; border-radius: 6px; color: #050a14;'>
                    {$safeCode}
                </span>
            </div>
            <p style='font-size: 13px; color: #777;'>If you did not request this code, you can safely ignore this email. Never share this code with anyone.</p>
            <hr style='border: none; border-top: 1px solid #eee; margin: 24px 0;'>
            <p style='font-size: 12px; color: #aaa;'>&copy; " . date('Y') . " StarlingCrest Finance. All rights reserved.</p>
        </div>
        ";
    }
}

class TransactionService {
    /**
     * Mask an account number, showing only the last 4 digits: •••• •••• •••• 7416
     */
    private static function maskAccount(?string $account): string {
        if (empty($account)) return 'N/A';
        $last4 = substr($account, -4);
        return "•••• •••• •••• {$last4}";
    }

    /**
     * HTML email template for a transfer receipt, styled to match the
     * Starling Crest branded receipt (navy header, success banner,
     * account route card, transaction detail rows).
     */
    public static function buildReceiptTemplate(array $tx): string {
        $amount     = htmlspecialchars(number_format((float)($tx['amount'] ?? 0), 2), ENT_QUOTES, 'UTF-8');
        $senderName = htmlspecialchars($tx['sender_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $senderAcc  = self::maskAccount($tx['sender_account'] ?? null);
        $recName    = htmlspecialchars($tx['recipient_name'] ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $recAcc     = self::maskAccount($tx['recipient_account'] ?? null);
        $reference  = htmlspecialchars($tx['reference'] ?? 'N/A', ENT_QUOTES, 'UTF-8');
        $narration  = htmlspecialchars($tx['narration'] ?: 'Transfer', ENT_QUOTES, 'UTF-8');
        $date       = htmlspecialchars($tx['created_at'] ?? date('Y-m-d H:i:s'), ENT_QUOTES, 'UTF-8');
        $type       = htmlspecialchars(strtoupper($tx['type'] ?? 'DEBIT'), ENT_QUOTES, 'UTF-8');
        $channel    = htmlspecialchars(strtoupper($tx['transfer_type'] ?? $tx['channel'] ?? 'INTERNAL'), ENT_QUOTES, 'UTF-8');
        $status     = htmlspecialchars(strtoupper($tx['status'] ?? 'COMPLETED'), ENT_QUOTES, 'UTF-8');
        $isInternational = stripos($channel, 'INTERNATIONAL') !== false;

        // -----------------------------------------------------------------
        // Basic template for internal/local transfers
        // -----------------------------------------------------------------
        if (!$isInternational) {
            return "
            <div style='font-family: Arial, sans-serif; max-width: 460px; margin: 0 auto; padding: 24px; border: 1px solid #e5e5e5; border-radius: 8px;'>
                <h2 style='color: #0a1f3d; margin-bottom: 4px;'>Transfer Receipt</h2>
                <p style='color: #999; font-size: 12px; margin-top: 0;'>Starling Crest Finance</p>

                <div style='background: #e6f4ea; padding: 16px; text-align: center; border-radius: 8px; margin: 16px 0;'>
                    <div style='color: #1b5e20; font-size: 26px; font-weight: bold;'>\${$amount}</div>
                    <div style='color: #2e7d32; font-size: 12px;'>&#10003; Transfer Completed</div>
                </div>

                <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>
                    <tr><td style='padding: 6px 0; color: #999;'>To</td><td style='padding: 6px 0; text-align: right; font-weight: bold; color: #0a1f3d;'>{$recName}</td></tr>
                    <tr><td style='padding: 6px 0; color: #999;'>Narration</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$narration}</td></tr>
                    <tr><td style='padding: 6px 0; color: #999;'>Reference</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$reference}</td></tr>
                    <tr><td style='padding: 6px 0; color: #999;'>Date</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$date}</td></tr>
                    <tr><td style='padding: 6px 0; color: #999;'>Status</td><td style='padding: 6px 0; text-align: right; color: #2e7d32; font-weight: bold;'>{$status}</td></tr>
                </table>

                <p style='color: #bbb; font-size: 11px; text-align: center; margin-top: 20px;'>This receipt is system generated.</p>
            </div>
            ";
        }

        // -----------------------------------------------------------------
        // Full detailed template for international/external transfers
        // -----------------------------------------------------------------
        $intlRows = '';
        if (!empty($tx['manual_bank_name'])) {
            $bank = htmlspecialchars($tx['manual_bank_name'], ENT_QUOTES, 'UTF-8');
            $intlRows .= "<tr><td style='padding: 6px 0; color: #999;'>BANK</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$bank}</td></tr>";
        }
        if (!empty($tx['country'])) {
            $country = htmlspecialchars($tx['country'], ENT_QUOTES, 'UTF-8');
            $intlRows .= "<tr><td style='padding: 6px 0; color: #999;'>COUNTRY</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$country}</td></tr>";
        }
        if (!empty($tx['swift_code'])) {
            $swift = htmlspecialchars($tx['swift_code'], ENT_QUOTES, 'UTF-8');
            $intlRows .= "<tr><td style='padding: 6px 0; color: #999;'>SWIFT</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$swift}</td></tr>";
        }
        if (!empty($tx['iban'])) {
            $iban = htmlspecialchars($tx['iban'], ENT_QUOTES, 'UTF-8');
            $intlRows .= "<tr><td style='padding: 6px 0; color: #999;'>IBAN</td><td style='padding: 6px 0; text-align: right; color: #333;'>{$iban}</td></tr>";
        }

        return "
        <div style='font-family: \"Courier New\", monospace; max-width: 480px; margin: 0 auto; background: #faf6ee; border: 1px solid #e5ddd0;'>

            <!-- Header -->
            <div style='background: #0a1f3d; padding: 24px; text-align: center;'>
                <div style='color: #ffffff; font-size: 18px; font-weight: bold; letter-spacing: 1px;'>
                    &#9398;&nbsp; Starling Crest Finance &nbsp;&#9398;
                </div>
                <div style='color: #8a99b3; font-size: 11px; letter-spacing: 3px; margin-top: 6px;'>
                    BANK &middot; SECURE TRANSFER RECEIPT
                </div>
            </div>

            <!-- Success banner -->
            <div style='background: #e6f4ea; padding: 20px; text-align: center; border-bottom: 1px dashed #c9c0ae;'>
                <div style='color: #2e7d32; font-size: 10px; letter-spacing: 2px;'>TRANSACTION SUCCESSFUL</div>
                <div style='color: #1b5e20; font-size: 30px; font-weight: bold; margin: 6px 0;'>\${$amount}</div>
                <div style='color: #2e7d32; font-size: 11px;'>&#10003; PAYMENT CONFIRMED</div>
            </div>

            <div style='padding: 24px;'>

                <!-- Transfer route -->
                <div style='color: #999; font-size: 10px; letter-spacing: 2px; margin-bottom: 10px;'>TRANSFER ROUTE</div>
                <div style='background: #f1ece0; border: 1px solid #e5ddd0; padding: 16px; margin-bottom: 24px;'>
                    <div style='color: #999; font-size: 10px; letter-spacing: 1px;'>FROM ACCOUNT</div>
                    <div style='color: #0a1f3d; font-weight: bold; font-size: 14px; margin: 4px 0;'>{$senderName}</div>
                    <div style='color: #666; font-size: 13px;'>{$senderAcc}</div>

                    <div style='text-align: center; color: #999; font-size: 16px; margin: 10px 0;'>&darr;</div>

                    <div style='color: #999; font-size: 10px; letter-spacing: 1px;'>TO ACCOUNT</div>
                    <div style='color: #0a1f3d; font-weight: bold; font-size: 14px; margin: 4px 0;'>{$recName}</div>
                    <div style='color: #666; font-size: 13px;'>{$recAcc}</div>
                </div>

                <!-- Transaction details -->
                <div style='color: #999; font-size: 10px; letter-spacing: 2px; margin-bottom: 10px;'>TRANSACTION DETAILS</div>
                <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>
                    <tr>
                        <td style='padding: 6px 0; color: #999;'>TYPE</td>
                        <td style='padding: 6px 0; text-align: right; color: #0a1f3d; font-weight: bold;'>{$type}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #999;'>CHANNEL</td>
                        <td style='padding: 6px 0; text-align: right; color: #0a1f3d; font-weight: bold;'>{$channel}</td>
                    </tr>
                    {$intlRows}
                    <tr>
                        <td style='padding: 6px 0; color: #999; vertical-align: top;'>NARRATION</td>
                        <td style='padding: 6px 0; text-align: right; color: #333;'>{$narration}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #999;'>REF NO.</td>
                        <td style='padding: 6px 0; text-align: right; color: #333;'>{$reference}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #999;'>DATE</td>
                        <td style='padding: 6px 0; text-align: right; color: #333;'>{$date}</td>
                    </tr>
                    <tr>
                        <td style='padding: 6px 0; color: #999;'>STATUS</td>
                        <td style='padding: 6px 0; text-align: right; color: #2e7d32; font-weight: bold;'>&#10003; {$status}</td>
                    </tr>
                </table>

                <div style='text-align: center; color: #bbb; font-size: 10px; margin-top: 24px; padding-top: 16px; border-top: 1px dashed #e5ddd0;'>
                    THIS RECEIPT IS SYSTEM GENERATED<br>NO SIGNATURE REQUIRED
                </div>
            </div>
        </div>
        ";
    }
}

// ---------------------------------------------------------------------
// REQUEST HANDLING
// ---------------------------------------------------------------------
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

$data = [];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents("php://input");
    $decoded = json_decode($input, true);
    $data = $decoded ?: $_POST;
} else {
    $data = $_GET;
}

$userId = $data['id']     ?? null;
$action = $data['action'] ?? '';

if (empty($userId) || !ctype_digit((string)$userId)) {
    echo json_encode(["status" => "error", "message" => "Valid numeric id parameter is required"]);
    exit;
}
$userId = (int)$userId;

// Look up the user's email server-side. Frontend never needs to know or send it.
$email = UserService::getEmailById($conn, $userId);
if (!$email) {
    echo json_encode(["status" => "error", "message" => "User not found"]);
    exit;
}

// -----------------------------------------------------------------
// action=otp -> generate a fresh OTP for this user, store it, email it
// -----------------------------------------------------------------
if ($action === 'otp') {
    $type = $data['type'] ?? 'transfer'; // allow overriding otp type if needed

    $otp = OtpService::generateAndStore($conn, $userId, $type);

    $subject = "Your StarlingCrest Finance Verification Code";
    $body    = OtpService::buildTemplate($otp['code']);

    $response = EmailService::sendMail($email, $subject, $body);
    if ($response['status'] !== 'success') {
        logError("OTP generated but email failed for user_id: $userId", $response['message']);
    }
    echo json_encode($response);
    exit;
}

// -----------------------------------------------------------------
// action=reciept -> receive tx_data fields directly, email the receipt
// -----------------------------------------------------------------
if ($action === 'reciept') {
    $tx = [
        'amount'             => !empty($data['amount']) ? $data['amount'] : '0',
        'sender_name'        => !empty($data['sender_name']) ? $data['sender_name'] : 'N/A',
        'sender_account'     => $data['sender_account'] ?? '',
        'recipient_name'     => !empty($data['recipient_name']) ? $data['recipient_name'] : 'N/A',
        'recipient_account'  => $data['recipient_account'] ?? '',
        'reference'          => !empty($data['reference']) ? $data['reference'] : ('N/A-' . strtoupper(bin2hex(random_bytes(4)))),
        'created_at'         => !empty($data['created_at']) ? $data['created_at'] : date('Y-m-d H:i:s'),
        'narration'          => !empty($data['narration']) ? $data['narration'] : 'Transfer',
        'type'               => !empty($data['type']) ? $data['type'] : 'DEBIT',
        'channel'            => !empty($data['channel']) ? $data['channel'] : (!empty($data['transfer_type']) ? $data['transfer_type'] : 'INTERNAL'),
        'status'             => !empty($data['status']) ? $data['status'] : 'COMPLETED',
        'swift_code'         => $data['swift_code'] ?? '',
        'iban'               => $data['iban'] ?? '',
        'country'            => $data['country'] ?? '',
        'manual_bank_name'   => $data['manual_bank_name'] ?? '',
    ];

    $subject = "Your Transfer Receipt - Ref: {$tx['reference']}";
    $body    = TransactionService::buildReceiptTemplate($tx);

    $response = EmailService::sendMail($email, $subject, $body);
    if ($response['status'] !== 'success') {
        logError("Receipt generated but email failed for user_id: $userId, ref: {$tx['reference']}", $response['message']);
    }
    echo json_encode($response);
    exit;
}

// -----------------------------------------------------------------
// Fallback: generic email send (subject/body passed directly)
// -----------------------------------------------------------------
$subject = $data['subject'] ?? '';
$body    = $data['body'] ?? $data['message'] ?? '';

if (empty($subject)) {
    $subject = "StarlingCrest Finance - Notification";
}

if (empty($body)) {
    $body = "
        <h2>Welcome 🎉</h2>
        <p>Your account with <strong>StarlingCrest Finance</strong> is ready.</p>
        <p>If this wasn't you, kindly ignore this message.</p>
    ";
}

$response = EmailService::sendMail($email, $subject, $body);
echo json_encode($response);