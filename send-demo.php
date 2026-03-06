<?php

header('Content-Type: application/json');

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

function clean($value){
    return htmlspecialchars(trim($value));
}

$name = clean($_POST['name'] ?? '');
$company = clean($_POST['company'] ?? '');
$email = clean($_POST['email'] ?? '');
$team = clean($_POST['team'] ?? '');
$message = clean($_POST['message'] ?? '');

if(!$name || !$company || !$email){
    echo json_encode([
        "status" => "error",
        "message" => "Vul alle verplichte velden in."
    ]);
    exit;
}

if(!filter_var($email, FILTER_VALIDATE_EMAIL)){
    echo json_encode([
        "status" => "error",
        "message" => "Ongeldig e-mailadres."
    ]);
    exit;
}

$to = "info@hubshiftmanager.com";
$subject = "Nieuwe demo aanvraag - HubShiftManager";

$body = "
Nieuwe demo aanvraag ontvangen

Naam: $name
Bedrijf: $company
Email: $email
Teamgrootte: $team

Bericht:
$message
";

$headers = "From: HubShiftManager <no-reply@hubshiftmanager.com>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$mailSent = mail($to, $subject, $body, $headers);

if($mailSent){
    echo json_encode([
        "status" => "success",
        "message" => "Bedankt! We nemen snel contact met je op."
    ]);
}else{
    echo json_encode([
        "status" => "error",
        "message" => "Er ging iets mis. Probeer later opnieuw."
    ]);
}