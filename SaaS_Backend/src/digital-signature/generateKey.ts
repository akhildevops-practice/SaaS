const { generateKeyPairSync } = require('crypto');
// const fs = require('fs');

// // Generate 2048-bit RSA key pair
// const { publicKey, privateKey } = generateKeyPairSync('rsa', {
//   modulusLength: 2048,
//   publicKeyEncoding: {
//     type: 'spki', // Recommended format for public key
//     format: 'pem',
//   },
//   privateKeyEncoding: {
//     type: 'pkcs8', // Recommended format for private key
//     format: 'pem',
//   },
// });

// // Save to disk or store securely
// fs.writeFileSync('private_key.pem', privateKey);
// fs.writeFileSync('public_key.pem', publicKey);

// console.log('Keys generated.');

function generateUserKeyPair() {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
    publicKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
    privateKeyEncoding: {
      type: 'pkcs1',
      format: 'pem',
    },
  });

  return { publicKey, privateKey };
}
export default generateUserKeyPair;
