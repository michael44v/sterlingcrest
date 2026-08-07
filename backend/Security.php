<?php
/**
 * NorthBridge Bank - Security Utility Class
 */

class Security {
    private static $algo = 'HS256';

    // JWT: Generate Access Token
    public static function generateAccessToken($user_id, $role) {
        $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
        $payload = json_encode([
            'sub' => $user_id,
            'role' => $role,
            'iat' => time(),
            'exp' => time() + (15 * 60) // 15 minutes
        ]);

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
        $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));

        $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    }

    // JWT: Validate Access Token
    public static function validateAccessToken($token) {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception("Invalid token format");
        }

        list($header, $payload, $signature) = $parts;

        $valid_signature = hash_hmac('sha256', $header . "." . $payload, JWT_SECRET, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($valid_signature));

        if ($signature !== $base64UrlSignature) {
            throw new Exception("Invalid signature");
        }

        $decoded_payload = json_decode(base64_decode($payload), true);
        if ($decoded_payload['exp'] < time()) {
            throw new Exception("Token expired");
        }

        return $decoded_payload;
    }

    // JWT: Generate Refresh Token
    public static function generateRefreshToken() {
        return bin2hex(random_bytes(32));
    }

    // OTP: Generate 6-digit OTP
    public static function generateOTP($length = 6) {
        $otp = "";
        for ($i = 0; $i < $length; $i++) {
            $otp .= random_int(0, 9);
        }
        return $otp;
    }

    // Hash Password/PIN
    public static function hashData($data) {
        // Return plain text as requested: password and pin should not be shown as hash in the database
        return $data;
    }

    // Verify Password/PIN
    public static function verifyData($data, $hash) {
        // Support both plain text and old hashed passwords
        if ($data === $hash) {
            return true;
        }
        return password_verify($data, $hash);
    }
}
