<?php
// jwt.php - Simple JWT Encoder/Decoder for PHP without external dependencies

function generate_jwt($payload, $secret) {
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // Encode Header to Base64Url
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));

    // Encode Payload to Base64Url
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($payload)));

    // Create Signature Hash
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);

    // Encode Signature to Base64Url
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    // Valid JWT
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

function verify_jwt($jwt, $secret) {
    // split the jwt
    $tokenParts = explode('.', $jwt);
    
    if (count($tokenParts) != 3) {
        return false;
    }
    
    $header = base64_decode($tokenParts[0]);
    $payload = base64_decode($tokenParts[1]);
    $signature_provided = $tokenParts[2];

    // check the expiration time - note this will cause an error if there is no 'exp' claim in the jwt
    $expiration = json_decode($payload)->exp ?? 0;
    
    if (($expiration - time()) < 0) {
        return false; // Expired
    }

    // build a signature based on the header and payload using the secret
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

    // verify it matches the signature provided
    if ($base64UrlSignature === $signature_provided) {
        return json_decode($payload, true);
    } else {
        return false;
    }
}
?>
