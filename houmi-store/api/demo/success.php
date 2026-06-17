<!DOCTYPE html>
<html>
<head>
    <title>Ex-cle IPG</title>
    <link href="Style/bootstrap.min.css" rel="stylesheet" type="text/css">
    <link href="Style/style.css" rel="stylesheet" type="text/css">
</head>
<body>

    <nav class="navbar d-flex navbar-white">

        <div class="navbar-header">
            <a class="navbar-brand align-middle">
                <div class="brand-logo">
                    <img class="img-fluid" src="./images/BiopagoBDV-red-logo.png" alt="App Logo" />
                </div>
            </a>
        </div>

        <div class="navbar-nav nav-link mr-auto flex-row flex-fill no-backgrund"
             style="background-image: url(./images/bpbdv-header-bg.png);background-position-x: right;background-repeat: no-repeat; padding: 1.74rem 0.95rem;">
        </div>

        <ul class="navbar-nav flex-row align-items-center bg-white-lg-none">
            <li class="nav-item d-none d-md-block d-lg-block">
                <a class="nav-link pointer align-self-middle p-0 text-center"
                   target="_blank"
                   href="#">
                    <img class="w-50"
                         src="./images/bpbdv-white-logo.png"
                         alt="ExCle" />
                </a>
            </li>

            <li class="nav-item d-none d-md-block d-lg-block">
                <a class="nav-link pointer align-self-middle p-0 pr-2"
                   target="_blank"
                   href="#">
                    <img src="./images/bdv-white-isologo.png"
                         alt="BiopagoBDV" />
                </a>
            </li>
        </ul>
    </nav>
    <div class="container">
         <div class="row justify-content-md-center">
            <div class="col-12 col-md-9">
		        <form>
                    <div class="card">
                       <h5 class="card-header">Resultado del Pago</h5>
                        <div class="card-body">
			                <p id="jsonResponse"></p>
                            <table id="checkPaymentTable" class="table table-striped">
                                <tbody></tbody>
                            </table>
                        </div>
                    </div>
		        </form>		
           </div>
         </div>
        
         <div id="spinner">
            <div class="spinner-border text-primary" role="status">
            </div>
        </div>
        
    </div>
	
    <script type="text/javascript" src="Scripts/jquery-3.6.4.min.js"></script>
    <script type="text/javascript" src="Scripts/bootstrap.min.js"></script>
    <script type="text/javascript">

        $(function () {
            var tokenValue ="<?php echo $_GET["token"];?>";
            
            checkPayment(tokenValue);

            $('#refresh').click(function () {
                checkPayment(tokenValue);
            });	
        });
       
        function checkPayment(tokenValue){
        $.ajax({
            url:'CheckPayment-ajax.php',
            type: "POST",
            data:{token:tokenValue},
            success:function(data){

                jsonResponse = JSON.parse(data);
                    
                var table = $('#checkPaymentTable tbody');
                    table.html('');
                for (var prop in jsonResponse) {
                    var tr = $('<tr>');
                    var td1 = $('<td>');
                    var td2 = $('<td>');
                    td1.html(prop);
                    td2.html(jsonResponse[prop].toString());
                    tr.append(td1);
                    tr.append(td2);
                    table.append(tr);
                }
            },
            beforeSend: function () {
                $("#spinner").addClass("show");
            },
            complete: function () {
                $("#spinner").removeClass("show");
            }
        });	
    }

    </script>
</body>
</html>