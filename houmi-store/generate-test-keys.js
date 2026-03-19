const crypto = require('crypto');
const fs = require('fs');

// Generate RSA key pair (2048 bits)
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
    },
    privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
    }
});

// Save keys
fs.writeFileSync('mercantil_test_private.pem', privateKey);
fs.writeFileSync('mercantil_test_public.pem', publicKey);

console.log('✅ Test RSA keys generated:');
console.log('   - mercantil_test_private.pem (use this for MERCANTIL_MASTER_KEY)');
console.log('   - mercantil_test_public.pem (for testing encryption)');
console.log('\n⚠️  IMPORTANT: These are TEST keys only!');
console.log('   Replace with real keys from Banco Mercantil for production.');
