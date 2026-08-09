<?php
require __DIR__ . '/src/PHPMailer.php';
require __DIR__ . '/src/SMTP.php';
require __DIR__ . '/src/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class EmailService {

    private static function createMailer(): PHPMailer {
        $mail = new PHPMailer(true);

        $mail->isSMTP();
        $mail->Host       = 'mail.bluevult.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'support@bluevult.com';
        $mail->Password   = 'victor47009A';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = 465;

        $mail->CharSet    = 'UTF-8';
        $mail->setFrom('support@bluevult.com', 'StarlingCrest Finance');

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
            return [
                "status" => "error",
                "message" => $mail->ErrorInfo
            ];
        }
    }
}

// 🔥 Handle GET/POST request
header('Content-Type: application/json');

// Enable CORS for external or local requests
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
    if ($decoded) {
        $data = $decoded;
    } else {
        $data = $_POST;
    }
} else {
    $data = $_GET;
}

$email = $data['email'] ?? '';
$subject = $data['subject'] ?? '';
$body = $data['body'] ?? $data['message'] ?? '';

if (empty($email)) {
    echo json_encode([
        "status" => "error",
        "message" => "Email parameter is required"
    ]);
    exit;
}

// sanitize + validate
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode([
        "status" => "error",
        "message" => "Invalid email format"
    ]);
    exit;
}

if (empty($subject)) {
    $subject = "StarlingCrest Finance - Notification";
}

if (empty($body)) {
    // default welcome body if empty
    $body = "
        <h2>Welcome 🎉</h2>
        <p>Your account with <strong>StarlingCrest Finance</strong> is ready.</p>
        <p>If this wasn't you, kindly ignore this message.</p>
    ";
}

// send email
$response = EmailService::sendMail($email, $subject, $body);
echo json_encode($response);
