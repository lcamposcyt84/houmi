<?php
require_once ('ipg2-bdv.php');

if( isset($_POST) ){		

	$PaymentProcess = new IpgBdv2 ("72744004","Htnq1p3J");//Instanciación de la API de pago con usuario y clave
	$response = $PaymentProcess->checkPayment($_POST['token']);
	
    echo json_encode($response);
}
else{
	echo 'Not a post';
}
?>