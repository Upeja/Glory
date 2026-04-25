<?php
/**
 * Glory Strategic Alliance — Contact Form Handler
 * PHP 7.4+
 */

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// ─── Configuration ─────────────────────────────────────────────
define('RECIPIENT_EMAIL', 'info@glorystrategic.lk');   // ← Update
define('SENDER_NAME',     'Glory Strategic Alliance Website');
define('SITE_NAME',       'Glory Strategic Alliance');

// ─── CORS / Method check ────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
    exit;
}

// ─── Sanitize & validate ────────────────────────────────────────
function clean(string $value): string {
    return htmlspecialchars(trim(strip_tags($value)), ENT_QUOTES, 'UTF-8');
}

$firstName = clean($_POST['first_name'] ?? '');
$lastName  = clean($_POST['last_name']  ?? '');
$email     = filter_var(trim($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$phone     = clean($_POST['phone']   ?? '');
$subject   = clean($_POST['subject'] ?? '');
$message   = clean($_POST['message'] ?? '');

$errors = [];

if (empty($firstName))                    $errors[] = 'First name is required.';
if (empty($lastName))                     $errors[] = 'Last name is required.';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'A valid email address is required.';
if (empty($subject))                      $errors[] = 'Please select a service of interest.';
if (strlen(trim($message)) < 10)          $errors[] = 'Please write a message of at least 10 characters.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// ─── Build email ─────────────────────────────────────────────────
$fullName   = "$firstName $lastName";
$emailSubject = "[Website Enquiry] $subject — $fullName";

$body = "
=======================================================
 New Contact Form Submission — " . SITE_NAME . "
=======================================================

Name    : $fullName
Email   : $email
Phone   : " . ($phone ?: 'Not provided') . "
Service : $subject

Message :
---------
$message

=======================================================
This message was sent from the " . SITE_NAME . " website.
";

$headers  = "From: " . SENDER_NAME . " <no-reply@glorystrategic.lk>\r\n";
$headers .= "Reply-To: $fullName <$email>\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION;

// ─── Send email ──────────────────────────────────────────────────
$sent = mail(RECIPIENT_EMAIL, $emailSubject, $body, $headers);

if ($sent) {
    echo json_encode([
        'success' => true,
        'message' => "Thank you, $firstName! Your message has been sent. We'll get back to you within 24 hours."
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Sorry, there was a server error sending your message. Please email us directly at ' . RECIPIENT_EMAIL
    ]);
}
