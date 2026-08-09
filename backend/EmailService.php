<?php
/**
 * StarlingCrest Finance - Email Service
 */

class EmailService {

    private static function sendEmail($to, $subject, $body) {
        // 1. Logging for development
        $log_entry = "[" . date('Y-m-d H:i:s') . "] TO: $to | SUBJECT: $subject\nBODY: " . strip_tags($body) . "\n------------------\n";
        file_put_contents(__DIR__ . "/mail.log", $log_entry, FILE_APPEND);

        // 2. Perform external Curl request to sterlingbank/mail.php
        $payload = [
            "email"   => $to,
            "subject" => $subject,
            "message" => $body
        ];

        try {
            $ch = curl_init('https://bluevult.com/api/sterlingbank/mail.php');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_TIMEOUT, 15);
            $response = curl_exec($ch);
            curl_close($ch);
        } catch (Exception $e) {
            // Silently log exception and do not fail the execution
            file_put_contents(__DIR__ . "/mail.log", "Curl exception: " . $e->getMessage() . "\n", FILE_APPEND);
        }

        return true;
    }

    private static function buildEmailTemplate($name, $title, $subtitle, $content) {
        $brand_orange = "#fe820e";
        $brand_dark   = "#1c1917";
        $brand_light  = "#fff7ed";
        $brand_name   = "StarlingCrest Finance";
        $support_email= "support@starlingcrestfinance.com";

        $html = "<div style='font-family: Arial, sans-serif; background-color: " . $brand_light . "; color: " . $brand_dark . "; padding: 24px; border-radius: 12px; border: 1px solid #ffedd5; box-shadow: 0 4px 15px rgba(28,25,23,0.05); max-width: 500px; margin: 20px auto; text-align: left;'>";
        $html .= "<div style='background-color: " . $brand_dark . "; padding: 24px; text-align: center; border-radius: 8px 8px 0 0; border-bottom: 4px solid " . $brand_orange . ";'>";
        $html .= "<h2 style='color: #ffffff; margin: 0; font-size: 22px; font-weight: 800; letter-spacing: -0.5px;'>" . $brand_name . "</h2>";
        $html .= "<p style='color: " . $brand_orange . "; margin: 4px 0 0; font-size: 10px; text-transform: uppercase; font-weight: 700; letter-spacing: 2px;'>" . $subtitle . "</p>";
        $html .= "</div>";
        $html .= "<div style='background-color: #ffffff; padding: 24px; border-radius: 0 0 8px 8px; border: 1px solid #f1f5f9; border-top: none;'>";
        if (!empty($name)) {
            $html .= "<p style='font-size: 15px; line-height: 1.6; color: " . $brand_dark . "; margin-top: 0;'>Hello " . htmlspecialchars($name) . ",</p>";
        }
        $html .= $content;
        $html .= "<div style='margin-top: 24px; padding-top: 16px; border-top: 1px solid #f1f5f9; font-size: 11px; color: #64748b; line-height: 1.5;'>";
        $html .= "<strong style='color: " . $brand_dark . ";'>" . $brand_name . "</strong><br/>";
        $html .= "Need assistance? Contact our secure desk at <a href='mailto:" . $support_email . "' style='color: " . $brand_orange . "; text-decoration: none; font-weight: 600;'>" . $support_email . "</a>";
        $html .= "</div>";
        $html .= "</div>";
        $html .= "</div>";

        // Strip carriage returns and newlines to prevent nl2br formatting corruption
        return str_replace(["\r", "\n"], '', $html);
    }

    public static function sendOTPEmail($to, $name, $otp, $type) {
        $subject = "StarlingCrest Finance - " . ucfirst($type) . " OTP";
        $title = "One-Time Password (OTP)";
        $subtitle = "Secure OTP Verification";

        $content = "
            <p style='font-size: 14px; line-height: 1.6; color: #475569;'>A request has been received to perform a <strong>" . htmlspecialchars($type) . "</strong> verification.</p>
            <div style='background-color: #fcfcfc; border: 1px solid #e2e8f0; padding: 16px; border-radius: 8px; text-align: center; margin: 20px 0;'>
                <span style='font-size: 28px; font-weight: 800; letter-spacing: 4px; color: #fe820e;'>" . htmlspecialchars($otp) . "</span>
                <p style='font-size: 11px; color: #94a3b8; margin: 8px 0 0;'>This code expires in 10 minutes.</p>
            </div>
            <p style='font-size: 13px; color: #64748b; line-height: 1.5;'>If you did not initiate this request, please contact our support desk immediately to secure your account.</p>
        ";

        $body = self::buildEmailTemplate($name, $title, $subtitle, $content);
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendTransferReceiptEmail($to, $name, $tx) {
        $subject = "Transaction Receipt - " . $tx['reference'];
        $title = "Transaction Receipt";
        $subtitle = "Secure Receipt Confirmation";

        $amount_formatted = "$" . number_format($tx['amount'], 2);

        $sender_acct_masked = "•••• " . substr($tx['sender_account'], -4);
        $recipient_acct_masked = $tx['recipient_account'] ? ("•••• " . substr($tx['recipient_account'], -4)) : "N/A";

        $recipient_details = $tx['recipient_name'];
        if ($tx['recipient_account']) {
            $recipient_details .= " (" . $recipient_acct_masked . ")";
        }

        $content = "
            <p style='font-size: 14px; line-height: 1.6; color: #475569;'>Your transfer transaction has been successfully processed.</p>
            <div style='background-color: #fcfcfc; border: 1px solid #e2e8f0; padding: 18px; border-radius: 8px; margin: 20px 0;'>
                <table style='width: 100%; border-collapse: collapse; font-size: 13px;'>
                    <tr>
                        <td style='padding: 6px 0; color: #64748b; font-weight: 600;'>Amount:</td>
                        <td style='padding: 6px 0; text-align: right; color: #fe820e; font-weight: 800; font-size: 16px;'>" . $amount_formatted . "</td>
                    </tr>
                    <tr style='border-top: 1px solid #f1f5f9;'>
                        <td style='padding: 6px 0; color: #64748b;'>From:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: bold; color: #1c1917;'>" . htmlspecialchars($tx['sender_name']) . " (" . $sender_acct_masked . ")</td>
                    </tr>
                    <tr style='border-top: 1px solid #f1f5f9;'>
                        <td style='padding: 6px 0; color: #64748b;'>To:</td>
                        <td style='padding: 6px 0; text-align: right; font-weight: bold; color: #1c1917;'>" . htmlspecialchars($recipient_details) . "</td>
                    </tr>
                    <tr style='border-top: 1px solid #f1f5f9;'>
                        <td style='padding: 6px 0; color: #64748b;'>Reference:</td>
                        <td style='padding: 6px 0; text-align: right; font-family: monospace; color: #475569;'>" . htmlspecialchars($tx['reference']) . "</td>
                    </tr>
                    <tr style='border-top: 1px solid #f1f5f9;'>
                        <td style='padding: 6px 0; color: #64748b;'>Date & Time:</td>
                        <td style='padding: 6px 0; text-align: right; color: #475569;'>" . htmlspecialchars($tx['created_at']) . "</td>
                    </tr>
                    <tr style='border-top: 1px solid #f1f5f9;'>
                        <td style='padding: 6px 0; color: #64748b;'>Narration:</td>
                        <td style='padding: 6px 0; text-align: right; color: #475569;'>" . htmlspecialchars($tx['narration']) . "</td>
                    </tr>
                    <tr style='border-top: 1px solid #f1f5f9;'>
                        <td style='padding: 6px 0; color: #64748b;'>Status:</td>
                        <td style='padding: 6px 0; text-align: right; color: #22c55e; font-weight: 700;'>✓ COMPLETED</td>
                    </tr>
                </table>
            </div>
            <p style='font-size: 12px; color: #94a3b8; text-align: center;'>This is an automated confirmation of your transaction.</p>
        ";

        $body = self::buildEmailTemplate($name, $title, $subtitle, $content);
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendDebitAlert($to, $name, $amount, $narration, $balance, $reference, $counterparty_name) {
        $subject = "Debit Alert - StarlingCrest Finance";
        $title = "Debit Alert";
        $subtitle = "Transaction Notification";

        $content = "
            <p style='font-size: 14px; line-height: 1.6; color: #475569;'>A debit transaction of <strong>$" . number_format($amount, 2) . "</strong> has occurred on your account.</p>
            <div style='background-color: #fcfcfc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 15px 0; font-size: 13px;'>
                <p style='margin: 4px 0;'><strong>Reference:</strong> " . htmlspecialchars($reference) . "</p>
                <p style='margin: 4px 0;'><strong>Narration:</strong> " . htmlspecialchars($narration) . "</p>
                <p style='margin: 4px 0;'><strong>Counterparty:</strong> " . htmlspecialchars($counterparty_name) . "</p>
            </div>
        ";

        $body = self::buildEmailTemplate($name, $title, $subtitle, $content);
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendCreditAlert($to, $name, $amount, $narration, $balance, $reference, $counterparty_name) {
        $subject = "Credit Alert - StarlingCrest Finance";
        $title = "Credit Alert";
        $subtitle = "Transaction Notification";

        $content = "
            <p style='font-size: 14px; line-height: 1.6; color: #475569;'>A credit transaction of <strong>$" . number_format($amount, 2) . "</strong> has occurred on your account.</p>
            <div style='background-color: #fcfcfc; border: 1px solid #e2e8f0; padding: 14px; border-radius: 8px; margin: 15px 0; font-size: 13px;'>
                <p style='margin: 4px 0;'><strong>Reference:</strong> " . htmlspecialchars($reference) . "</p>
                <p style='margin: 4px 0;'><strong>Narration:</strong> " . htmlspecialchars($narration) . "</p>
                <p style='margin: 4px 0;'><strong>Counterparty:</strong> " . htmlspecialchars($counterparty_name) . "</p>
            </div>
        ";

        $body = self::buildEmailTemplate($name, $title, $subtitle, $content);
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendKYCStatusEmail($to, $name, $tier, $status, $rejection_reason = null) {
        $subject = "KYC Update - StarlingCrest Finance";
        $title = "KYC Verification Update";
        $subtitle = "Account KYC Status";

        $content = "
            <p style='font-size: 14px; line-height: 1.6; color: #475569;'>Your KYC Tier $tier submission status is: <strong style='color: " . ($status === 'approved' ? '#22c55e' : '#ef4444') . ";'>" . strtoupper($status) . "</strong>.</p>
        ";
        if ($rejection_reason) {
            $content .= "<p style='font-size: 13px; color: #ef4444; margin-top: 8px;'>Reason: " . htmlspecialchars($rejection_reason) . "</p>";
        }

        $body = self::buildEmailTemplate($name, $title, $subtitle, $content);
        return self::sendEmail($to, $subject, $body);
    }
}
