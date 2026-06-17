<?php
require_once ('ipg2-bdv.php');

if( isset($_POST) )
{		
	//Creación de solicitud de pago
	$Payment = new IpgBdvPaymentRequest();
	$Payment->idLetter= $_POST['identificationNac']; //Letra de la cédula - V, E o P
	$Payment->idNumber= $_POST['identificationNumber']; //Número de cédula
	$Payment->amount= $_POST['amount']; //Monto a combrar, DECIMAL
	$Payment->currency= $_POST['currency']; //Moneda del pago, 0 - Bolivar Fuerte, 1 - Dolar
	$Payment->reference= $_POST['reference']; //Código de referecia o factura
	$Payment->title= $_POST['title']; //Titulo para el pago, Ej: Servicio de Cable
	$Payment->description= $_POST['description']; //Descripción del pago, Ej: Abono mes de marzo 2017
	$Payment->email= $_POST['email'];
	$Payment->cellphone= $_POST['cellphone'];
	$Payment->urlToReturn= $_SERVER['REQUEST_SCHEME']."://".$_SERVER['HTTP_HOST'].'/ipg2-bdv-demo/success.php?token={ID}'; //URL de retrono al finalizar el pago
	$Payment->rifLetter= $_POST['rifLetter'] ?? ''; //Letra de la cédula - V, E o P
	$Payment->rifNumber= $_POST['rifNumber'] ?? ''; //Número de cédula

	
	$PaymentProcess = new IpgBdv2 ("72744004","Htnq1p3J");//Instanciación de la API de pago con usuario y clave
	$response = $PaymentProcess->createPayment($Payment);
	
	if ($response->success == true) // Se procesó correctamente y es necesario redirigir a la página de pago
	{
		if (strtolower(filter_input(INPUT_SERVER, 'HTTP_X_REQUESTED_WITH')) === 'xmlhttprequest') { //si es ajax
			header('Content-type: application/json');
			echo json_encode($response);			
		}
		else{ //si no es ajax
			header("Location: ".$response->urlPayment); //W
			die();
		}		
	}
	else
	{
		header('Content-type: application/json');
		echo json_encode($response);
	}

}
else{
	echo 'Not a post';
}
?>