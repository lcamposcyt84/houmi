const fs = require('fs');
fetch('https://api.houmi.shop/auth/register.php', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        firstName: 'Leonardo',
        lastName: 'Campos',
        email: 'lcamposcyt@gmail.com',
        password: 'Password123',
        phone: '+5804245547749'
    })
})
.then(res => res.text())
.then(text => fs.writeFileSync('c:\\xampp\\htdocs\\houmi-master\\test_reg_out.txt', text))
.catch(err => fs.writeFileSync('c:\\xampp\\htdocs\\houmi-master\\test_reg_out.txt', err.toString()));
