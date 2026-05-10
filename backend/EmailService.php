<?php
/**
 * NorthBridge Bank - Email Service
 */

class EmailService {
    // This is a placeholder for PHPMailer integration as specified in the docs.
    // PHPMailer would be installed via Composer and required here.

    private static function sendEmail($to, $subject, $body) {
        // Implementation for sending email using PHPMailer
        // $mail = new PHPMailer(true);
        // ... configure SMTP ...
        // $mail->send();

        // For now, it's a stub
        return true;
    }

    public static function sendOTPEmail($to, $name, $otp, $type) {
        $subject = "NorthBridge Bank - " . ucfirst($type) . " OTP";
        $body = "<h1>NorthBridge Bank</h1><p>Hello $name,</p><p>Your OTP code is: <strong>$otp</strong></p>";
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendDebitAlert($to, $name, $amount, $narration, $balance, $reference, $counterparty_name) {
        $subject = "Debit Alert - NorthBridge Bank";
        $body = "<h1>NorthBridge Bank</h1><p>Hello $name,</p><p>A debit transaction of $$amount has occurred on your account.</p>";
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendCreditAlert($to, $name, $amount, $narration, $balance, $reference, $counterparty_name) {
        $subject = "Credit Alert - NorthBridge Bank";
        $body = "<h1>NorthBridge Bank</h1><p>Hello $name,</p><p>A credit transaction of $$amount has occurred on your account.</p>";
        return self::sendEmail($to, $subject, $body);
    }

    public static function sendKYCStatusEmail($to, $name, $tier, $status, $rejection_reason = null) {
        $subject = "KYC Update - NorthBridge Bank";
        $body = "<h1>NorthBridge Bank</h1><p>Hello $name,</p><p>Your KYC Tier $tier submission status is: $status.</p>";
        if ($rejection_reason) {
            $body .= "<p>Reason: $rejection_reason</p>";
        }
        return self::sendEmail($to, $subject, $body);
    }
}
