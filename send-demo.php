<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/autoload.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'error',
        'message' => 'Method not allowed.'
    ]);
    exit;
}

function clean_input(?string $value): string {
    return trim((string)$value);
}

$name    = clean_input($_POST['name'] ?? '');
$company = clean_input($_POST['company'] ?? '');
$email   = clean_input($_POST['email'] ?? '');
$team    = clean_input($_POST['team'] ?? '');
$message = clean_input($_POST['message'] ?? '');
$recaptchaToken = clean_input($_POST['recaptcha_token'] ?? '');

/* Basic validation */
if ($name === '' || $company === '' || $email === '' || $team === '' || $message === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Vul alle verplichte velden in.'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'Ongeldig e-mailadres.'
    ]);
    exit;
}

$recaptchaSecret = '6LfLPIYsAAAAAPrK55ELDDEls389erzia5muw_ky';

if ($recaptchaToken === '') {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'reCAPTCHA ontbreekt.'
    ]);
    exit;
}

$postData = http_build_query([
    'secret'   => $recaptchaSecret,
    'response' => $recaptchaToken,
    'remoteip' => $_SERVER['REMOTE_ADDR'] ?? ''
]);

$context = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-type: application/x-www-form-urlencoded\r\n",
        'content' => $postData,
        'timeout' => 10
    ]
]);

$verifyResponse = file_get_contents(
    'https://www.google.com/recaptcha/api/siteverify',
    false,
    $context
);

if ($verifyResponse === false) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'reCAPTCHA verificatie mislukt.'
    ]);
    exit;
}

$captchaResult = json_decode($verifyResponse, true);

if (
    empty($captchaResult['success']) ||
    !isset($captchaResult['score']) ||
    $captchaResult['score'] < 0.5 ||
    ($captchaResult['action'] ?? '') !== 'demoForm'
) {
    http_response_code(400);
    echo json_encode([
        'status' => 'error',
        'message' => 'reCAPTCHA controle niet geslaagd.'
    ]);
    exit;
}

try {
    $mail = new PHPMailer(true);

    // SMTP config for OVH MX Plan
    $mail->isSMTP();
    $mail->Host       = 'ssl0.ovh.net';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'info@hubshiftmanager.com';
    $mail->Password   = 'XXXXXX';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
    $mail->Port       = 465;

    $mail->CharSet = 'UTF-8';

    // Nadawca MUSI być prawdziwą skrzynką z Twojej domeny
    $mail->setFrom('info@hubshiftmanager.com', 'HubShiftManager');
    $mail->addAddress('info@hubshiftmanager.com', 'HubShiftManager');
    $mail->addCC('lukasz@softcone.nl', 'Łukasz Tatarczyk');
    $mail->addCC('tomaszt@hotmail.nl', 'Tomasz Tabis');

    // Odpowiedź ma iść do osoby, która wypełniła formularz
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = 'Nieuwe demo aanvraag - HubShiftManager';

    $safeName    = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
    $safeCompany = htmlspecialchars($company, ENT_QUOTES, 'UTF-8');
    $safeEmail   = htmlspecialchars($email, ENT_QUOTES, 'UTF-8');
    $safeTeam    = htmlspecialchars($team, ENT_QUOTES, 'UTF-8');
    $safeMessage = nl2br(htmlspecialchars($message, ENT_QUOTES, 'UTF-8'));

    $mail->Body = "
        <h2>Nieuwe demo aanvraag</h2>
        <table cellpadding='8' cellspacing='0' border='0'>
            <tr><td><strong>Naam:</strong></td><td>{$safeName}</td></tr>
            <tr><td><strong>Bedrijf:</strong></td><td>{$safeCompany}</td></tr>
            <tr><td><strong>E-mail:</strong></td><td>{$safeEmail}</td></tr>
            <tr><td><strong>Teamgrootte:</strong></td><td>{$safeTeam}</td></tr>
        </table>
        <p><strong>Bericht:</strong></p>
        <p>{$safeMessage}</p>
    ";

    $mail->AltBody =
        "Nieuwe demo aanvraag\n\n" .
        "Naam: {$name}\n" .
        "Bedrijf: {$company}\n" .
        "E-mail: {$email}\n" .
        "Teamgrootte: {$team}\n\n" .
        "Bericht:\n{$message}\n";

    $mail->send();

    echo json_encode([
        'status' => 'success',
        'message' => 'Bedankt! We nemen snel contact met je op.'
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => 'Mail kon niet worden verzonden.',
        'debug' => $mail->ErrorInfo
    ]);
}